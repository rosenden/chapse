export type ChapseTheme = 'light' | 'dark'
export type ArmMode = 'split' | 'arms_object'
export type ArmSource = 'arm_left' | 'arm_left_object' | 'arm_right' | 'arm_right_object'

export type AssetCategory =
  | 'torso'
  | 'head'
  | 'eyes'
  | 'hat'
  | 'arm_left'
  | 'arm_left_object'
  | 'arm_right'
  | 'arm_right_object'
  | 'arms_object'
  | 'example'

export interface RobotLayer {
  id: string
  url: string
  x: number
  y: number
  opacity?: number
  rotation?: number
  rotationOriginX?: number
  rotationOriginY?: number
}

export interface RobotComposition {
  theme: ChapseTheme
  head: string
  eyes: string
  hat: string
  showShadow?: boolean
  armMode: ArmMode
  leftSource: 'arm_left' | 'arm_left_object'
  leftAsset: string
  rightSource: 'arm_right' | 'arm_right_object'
  rightAsset: string
  armsObject: string
}

export interface RobotPreset {
  id: string
  label: string
  config: Omit<RobotComposition, 'theme'>
  referenceExample: string
}

export const ROBOT_CANVAS = {
  width: 88,
  height: 101,
} as const

const CATEGORIES: AssetCategory[] = [
  'torso',
  'head',
  'eyes',
  'hat',
  'arm_left',
  'arm_left_object',
  'arm_right',
  'arm_right_object',
  'arms_object',
  'example',
]

const modules = import.meta.glob<string>('../assets/chapse/**/*.svg', {
  eager: true,
  import: 'default',
})

type Catalog = Record<ChapseTheme, Record<AssetCategory, Record<string, string>>>

function createEmptyThemeRecord(): Record<AssetCategory, Record<string, string>> {
  return {
    torso: {},
    head: {},
    eyes: {},
    hat: {},
    arm_left: {},
    arm_left_object: {},
    arm_right: {},
    arm_right_object: {},
    arms_object: {},
    example: {},
  }
}

const catalog: Catalog = {
  light: createEmptyThemeRecord(),
  dark: createEmptyThemeRecord(),
}

for (const [path, url] of Object.entries(modules)) {
  const themedMatch = path.match(/\/assets\/chapse\/(light|dark)\/([^/]+)\/([^/]+)\.svg$/)

  if (themedMatch) {
    const theme = themedMatch[1] as ChapseTheme
    const rawCategory = themedMatch[2]
    const rawName = themedMatch[3]

    if (!CATEGORIES.includes(rawCategory as AssetCategory)) {
      continue
    }

    const category = rawCategory as AssetCategory
    const value = rawName.includes('=') ? rawName.split('=')[1] : rawName
    catalog[theme][category][value] = url
    continue
  }

  const hatMatch = path.match(/\/assets\/chapse\/accessory\/hat\/([^/]+)\.svg$/)
  if (!hatMatch) {
    continue
  }

  const rawName = hatMatch[1]
  const value = rawName.includes('=') ? rawName.split('=')[1] : rawName
  catalog.light.hat[value] = url
  catalog.dark.hat[value] = url
}

const positions = {
  torso: { x: 28.524, y: 42.087 },
  headDefault: { x: 14, y: 0 },
  headTilted: { x: 12.5, y: 0 },
  armLeft: { x: 0, y: 46.621 },
  armRight: { x: 48, y: 46.434 },
  // Calibrated to align shoulder joints with non-object arm variants (target canvas Y ≈ 53.442).
  armLeftObject: { x: 0, y: 38.976 },
  armRightObject: { x: 48, y: 39.163 },
  armsObject: { x: 0, y: 46.434 },
} as const

interface EyePlacement {
  x: number
  y: number
  rotation?: number
  rotationOriginX?: number
  rotationOriginY?: number
}

interface EyeSize {
  width: number
  height: number
}

interface HatPlacement {
  x: number
  y: number
  rotation?: number
  rotationOriginX?: number
  rotationOriginY?: number
}

interface HatSize {
  width: number
  height: number
}

const EYE_SIZES: Record<string, EyeSize> = {
  default: { width: 31, height: 17 },
  error: { width: 35, height: 17 },
  happy: { width: 33, height: 13 },
  loading: { width: 32, height: 13 },
  love: { width: 35, height: 17 },
  stars: { width: 36, height: 18 },
  sunglasses: { width: 39, height: 17 },
  wink: { width: 32, height: 17 },
}

const HAT_SIZES: Record<string, HatSize> = {
  cap: { width: 60, height: 26 },
  cap_detective: { width: 60, height: 27 },
  hat_hard: { width: 60, height: 27 },
  hat_wizard: { width: 75, height: 41 },
  hate: { width: 60, height: 23 },
}

const EYE_ANCHORS = {
  // Global centers extracted from native head source (eyes included).
  default: { x: 44, y: 24.833 },
  tilted: { x: 42.372, y: 25.02, rotation: -9.153 },
} as const

const HAT_ANCHORS = {
  // Derived from Figma reference compositions (default + tilted head alignment).
  default: { x: 43.367, y: 5.543 },
  tilted: { x: 41.739, y: 5.73, rotation: -9.153 },
} as const

function createShadowDataUri(fill: string, opacity?: number) {
  const opacityAttribute = opacity != null ? ` fill-opacity="${opacity}"` : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="7" viewBox="0 0 28 7"><ellipse cx="14" cy="3.50065" rx="13.803" ry="3.00065" fill="${fill}"${opacityAttribute}/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const SHADOW_LAYER: Record<ChapseTheme, { url: string; x: number; y: number }> = {
  light: {
    // Matches light examples: cx=44 cy=97.0006 rx=13.803 ry=3.00065
    url: createShadowDataUri('#607C7F', 0.2),
    x: 30.197,
    y: 94,
  },
  dark: {
    // Matches dark examples: cx=44 cy=97.0714 rx=13.803 ry=3.00065
    url: createShadowDataUri('#445556'),
    x: 30.197,
    y: 94.07075,
  },
}

function getEyePlacement(expression: string, isHeadTilted: boolean): EyePlacement {
  const eyeSize = EYE_SIZES[expression] ?? EYE_SIZES.default

  if (!isHeadTilted) {
    return {
      x: EYE_ANCHORS.default.x - eyeSize.width / 2,
      y: EYE_ANCHORS.default.y - eyeSize.height / 2,
    }
  }

  return {
    x: EYE_ANCHORS.tilted.x - eyeSize.width / 2,
    y: EYE_ANCHORS.tilted.y - eyeSize.height / 2,
    rotation: EYE_ANCHORS.tilted.rotation,
    rotationOriginX: eyeSize.width / 2,
    rotationOriginY: eyeSize.height / 2,
  }
}

function getHatPlacement(hat: string, isHeadTilted: boolean): HatPlacement {
  const hatSize = HAT_SIZES[hat] ?? HAT_SIZES.hate

  if (!isHeadTilted) {
    return {
      x: HAT_ANCHORS.default.x - hatSize.width / 2,
      y: HAT_ANCHORS.default.y - hatSize.height / 2,
    }
  }

  return {
    x: HAT_ANCHORS.tilted.x - hatSize.width / 2,
    y: HAT_ANCHORS.tilted.y - hatSize.height / 2,
    rotation: HAT_ANCHORS.tilted.rotation,
    rotationOriginX: hatSize.width / 2,
    rotationOriginY: hatSize.height / 2,
  }
}

const armObjectOffsets: Record<string, { x?: number; y?: number }> = {
  oops: { y: 46.343 },
  globe: { y: 47.114 },
  modifiable: { y: 46.434 },
}

type SplitArmCategory = 'arm_left' | 'arm_left_object' | 'arm_right' | 'arm_right_object'
type OffsetMap = Record<string, { x?: number; y?: number }>

const splitArmOffsets: Record<ChapseTheme, Record<SplitArmCategory, OffsetMap>> = {
  light: {
    arm_left: {
      hold_fist_up_side: { x: -1.837, y: 1.329 },
      hold_thumbs_up_side: { x: -1.837, y: 1.329 },
      hold_zen_up_side: { x: -3.957, y: 1.3 },
      rest_open_down_side: { x: 0.323, y: 1.254 },
      wave_open_up_side: { x: -3.837, y: -7.239 },
      wave_point_up_side: { x: -4.264, y: -3.957 },
    },
    arm_right: {
      hold_fist_up_side: { x: 1.981, y: 1.516 },
      hold_thumbs_up_side: { x: 1.981, y: 1.516 },
      hold_zen_up_side: { x: 1.981, y: 1.516 },
      rest_open_down_side: { x: -0.323, y: 1.239 },
      wave_open_up_side: { x: 3.538, y: -7.051 },
      wave_point_up_side: { x: 3.38, y: -3.584 },
    },
    arm_left_object: {
      key: { x: 0, y: 0 },
      light: { x: -1.704, y: -15.311 },
      magnifying_glass: { x: -6.511, y: -10.724 },
      megaphone: { x: -67.52, y: -22.547 },
      plane: { x: -9.397, y: -11.522 },
      spanner: { x: -0.421, y: -0.465 },
      trophe: { x: -11.639, y: -7.726 },
    },
    arm_right_object: {
      key: { x: 0, y: 0 },
      light: { y: -15.311 },
      magnifying_glass: { y: -10.724 },
      megaphone: { y: -28.066 },
      plane: { y: -11.522 },
      spanner: { y: -2.465 },
      trophe: { y: -9.45 },
    },
  },
  dark: {
    arm_left: {
      hold_fist_up_side: { x: -1.837, y: 1.516 },
      hold_thumbs_up_side: { x: -1.837, y: 1.516 },
      hold_zen_up_side: { x: -3.457, y: 1.516 },
      rest_open_down_side: { x: 0.323, y: 1.441 },
      wave_open_up_side: { x: -3.837, y: -7.051 },
      wave_point_up_side: { x: -3.678, y: -7.103 },
    },
    arm_right: {
      hold_fist_up_side: { x: 1.981, y: 1.516 },
      hold_thumbs_up_side: { x: 1.981, y: 1.516 },
      hold_zen_up_side: { x: 1.981, y: 1.516 },
      rest_open_down_side: { x: -0.323, y: 1.239 },
      wave_open_up_side: { x: 3.538, y: -7.051 },
      wave_point_up_side: { x: 3.38, y: -7.103 },
    },
    arm_left_object: {
      key: { x: 0, y: 0 },
      light: { x: -1.704, y: -15.311 },
      magnifying_glass: { x: -6.511, y: -10.724 },
      megaphone: { x: -67.52, y: -22.547 },
      plane: { x: -8.897, y: -11.522 },
      spanner: { x: 0.079, y: -0.465 },
      trophe: { x: -11.639, y: -7.726 },
    },
    arm_right_object: {
      key: { x: 0, y: 0 },
      light: { y: -15.311 },
      magnifying_glass: { y: -10.724 },
      megaphone: { y: -28.066 },
      plane: { y: -11.522 },
      spanner: { y: -1.465 },
      trophe: { y: -9.45 },
    },
  },
}

function getSplitArmPosition(theme: ChapseTheme, category: SplitArmCategory, key: string) {
  const base = {
    arm_left: positions.armLeft,
    arm_left_object: positions.armLeftObject,
    arm_right: positions.armRight,
    arm_right_object: positions.armRightObject,
  }[category]

  const categoryOffsets = splitArmOffsets[theme][category]
  const fallbackOffset =
    category === 'arm_left_object' || category === 'arm_right_object'
      ? (categoryOffsets.key ?? categoryOffsets.light ?? {})
      : {}
  const offset = categoryOffsets[key] ?? fallbackOffset

  return {
    x: base.x + (offset.x ?? 0),
    y: base.y + (offset.y ?? 0),
  }
}

export const ROBOT_PRESETS: RobotPreset[] = [
  {
    id: '01',
    label: '🙂',
    referenceExample: '01',
    config: {
      head: 'default',
      eyes: 'default',
      hat: '',
      showShadow: true,
      armMode: 'split',
      leftSource: 'arm_left',
      leftAsset: 'rest_open_down_front',
      rightSource: 'arm_right',
      rightAsset: 'rest_open_down_front',
      armsObject: 'modifiable',
    },
  },
  {
    id: '02',
    label: '😵',
    referenceExample: '02',
    config: {
      head: 'default',
      eyes: 'error',
      hat: '',
      showShadow: true,
      armMode: 'arms_object',
      leftSource: 'arm_left',
      leftAsset: 'rest_open_down_front',
      rightSource: 'arm_right',
      rightAsset: 'rest_open_down_front',
      armsObject: 'oops',
    },
  },
  {
    id: '03',
    label: '🔧',
    referenceExample: '03',
    config: {
      head: 'default',
      eyes: 'default',
      hat: 'hat_hard',
      showShadow: true,
      armMode: 'split',
      leftSource: 'arm_left',
      leftAsset: 'rest_open_down_front',
      rightSource: 'arm_right_object',
      rightAsset: 'spanner',
      armsObject: 'modifiable',
    },
  },
  {
    id: '04',
    label: '🌍',
    referenceExample: '04',
    config: {
      head: 'default',
      eyes: 'default',
      hat: '',
      showShadow: true,
      armMode: 'arms_object',
      leftSource: 'arm_left',
      leftAsset: 'rest_open_down_front',
      rightSource: 'arm_right',
      rightAsset: 'rest_open_down_front',
      armsObject: 'globe',
    },
  },
  {
    id: '05',
    label: '🏆',
    referenceExample: '05',
    config: {
      head: 'default',
      eyes: 'stars',
      hat: '',
      showShadow: true,
      armMode: 'split',
      leftSource: 'arm_left',
      leftAsset: 'rest_open_down_front',
      rightSource: 'arm_right_object',
      rightAsset: 'trophe',
      armsObject: 'modifiable',
    },
  },
]

function sortNatural(values: string[]) {
  return [...values].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  )
}

function humanize(value: string) {
  return value.replace(/_/g, ' ')
}

function getAssetUrl(theme: ChapseTheme, category: AssetCategory, key: string) {
  return catalog[theme][category][key]
}

export function getAssetKeys(theme: ChapseTheme, category: AssetCategory) {
  return sortNatural(Object.keys(catalog[theme][category]))
}

export function getSelectOptions(theme: ChapseTheme, category: AssetCategory) {
  return getAssetKeys(theme, category).map((value) => ({
    value,
    label: humanize(value),
  }))
}

export function ensureAssetKey(
  theme: ChapseTheme,
  category: AssetCategory,
  currentValue: string | null | undefined,
) {
  const values = getAssetKeys(theme, category)
  if (values.length === 0) {
    return ''
  }
  if (currentValue && values.includes(currentValue)) {
    return currentValue
  }
  return values[0]
}

export function getReferenceExample(theme: ChapseTheme, example: string): RobotLayer | null {
  const url = getAssetUrl(theme, 'example', example)
  if (!url) {
    return null
  }
  return {
    id: `reference-${theme}-${example}`,
    url,
    x: 0,
    y: 0,
    opacity: 0.28,
  }
}

export function buildRobotLayers(config: RobotComposition): RobotLayer[] {
  const torsoKey = ensureAssetKey(config.theme, 'torso', 'torso')
  const torsoUrl = getAssetUrl(config.theme, 'torso', torsoKey)
  const headUrl = getAssetUrl(config.theme, 'head', config.head)
  const eyesUrl = getAssetUrl(config.theme, 'eyes', config.eyes)
  const hatUrl = config.hat ? getAssetUrl(config.theme, 'hat', config.hat) : ''
  const isHeadTilted = config.head.includes('tilted')

  const layers: RobotLayer[] = []

  if (config.showShadow) {
    const shadow = SHADOW_LAYER[config.theme]
    layers.push({
      id: `shadow-${config.theme}`,
      url: shadow.url,
      x: shadow.x,
      y: shadow.y,
    })
  }

  if (torsoUrl) {
    layers.push({
      id: `torso-${torsoKey}`,
      url: torsoUrl,
      x: positions.torso.x,
      y: positions.torso.y,
    })
  }

  if (config.armMode === 'arms_object') {
    const armObjectUrl = getAssetUrl(config.theme, 'arms_object', config.armsObject)
    const armObjectOffset = armObjectOffsets[config.armsObject] ?? {}
    if (armObjectUrl) {
      layers.push({
        id: `arms-object-${config.armsObject}`,
        url: armObjectUrl,
        x: armObjectOffset.x ?? positions.armsObject.x,
        y: armObjectOffset.y ?? positions.armsObject.y,
      })
    }
  } else {
    const leftCategory = config.leftSource
    const rightCategory = config.rightSource
    const leftUrl = getAssetUrl(config.theme, leftCategory, config.leftAsset)
    const rightUrl = getAssetUrl(config.theme, rightCategory, config.rightAsset)

    if (leftUrl) {
      const leftPosition = getSplitArmPosition(config.theme, leftCategory, config.leftAsset)
      layers.push({
        id: `left-${leftCategory}-${config.leftAsset}`,
        url: leftUrl,
        x: leftPosition.x,
        y: leftPosition.y,
      })
    }

    if (rightUrl) {
      const rightPosition = getSplitArmPosition(config.theme, rightCategory, config.rightAsset)
      layers.push({
        id: `right-${rightCategory}-${config.rightAsset}`,
        url: rightUrl,
        x: rightPosition.x,
        y: rightPosition.y,
      })
    }
  }

  if (headUrl) {
    const headPosition = isHeadTilted ? positions.headTilted : positions.headDefault
    layers.push({
      id: `head-${config.head}`,
      url: headUrl,
      x: headPosition.x,
      y: headPosition.y,
    })
  }

  if (eyesUrl) {
    const eyePlacement = getEyePlacement(config.eyes, isHeadTilted)
    layers.push({
      id: `eyes-${config.eyes}`,
      url: eyesUrl,
      x: eyePlacement.x,
      y: eyePlacement.y,
      rotation: eyePlacement.rotation,
      rotationOriginX: eyePlacement.rotationOriginX,
      rotationOriginY: eyePlacement.rotationOriginY,
    })
  }

  if (hatUrl) {
    const hatPlacement = getHatPlacement(config.hat, isHeadTilted)
    layers.push({
      id: `hat-${config.hat}`,
      url: hatUrl,
      x: hatPlacement.x,
      y: hatPlacement.y,
      rotation: hatPlacement.rotation,
      rotationOriginX: hatPlacement.rotationOriginX,
      rotationOriginY: hatPlacement.rotationOriginY,
    })
  }

  return layers
}

interface SvgAssetMeta {
  raw: string
  width: number
  height: number
}

const assetMetaCache = new Map<string, Promise<SvgAssetMeta>>()

function parseSvgDimensions(svgContent: string) {
  const svgTagMatch = svgContent.match(/<svg\b[^>]*>/i)
  const svgTag = svgTagMatch?.[0] ?? ''

  const widthMatch = svgTag.match(/\bwidth="([\d.]+)(px)?"/i)
  const heightMatch = svgTag.match(/\bheight="([\d.]+)(px)?"/i)
  const viewBoxMatch = svgTag.match(/\bviewBox="([^"]+)"/i)

  const width = widthMatch ? Number.parseFloat(widthMatch[1]) : Number.NaN
  const height = heightMatch ? Number.parseFloat(heightMatch[1]) : Number.NaN

  if (Number.isFinite(width) && Number.isFinite(height)) {
    return { width, height }
  }

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/)
    if (parts.length === 4) {
      const vbWidth = Number.parseFloat(parts[2])
      const vbHeight = Number.parseFloat(parts[3])
      if (Number.isFinite(vbWidth) && Number.isFinite(vbHeight)) {
        return { width: vbWidth, height: vbHeight }
      }
    }
  }

  return { width: ROBOT_CANVAS.width, height: ROBOT_CANVAS.height }
}

async function getSvgAssetMeta(url: string): Promise<SvgAssetMeta> {
  if (!assetMetaCache.has(url)) {
    const promise = fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to load asset: ${url}`)
        }
        const raw = await response.text()
        const { width, height } = parseSvgDimensions(raw)
        return { raw, width, height }
      })
    assetMetaCache.set(url, promise)
  }

  return assetMetaCache.get(url)!
}

function extractSvgBody(raw: string): { defs: string; body: string; rootFill?: string; rootStroke?: string } {
  const svgTagMatch = raw.match(/<svg\b([^>]*)>/i)
  const rootAttrs = svgTagMatch?.[1] ?? ''
  const rootFill = rootAttrs.match(/\bfill="([^"]+)"/)?.[1]
  const rootStroke = rootAttrs.match(/\bstroke="([^"]+)"/)?.[1]

  // Extract inner content of <defs> blocks only (not the tags themselves)
  const defsContents = [...raw.matchAll(/<defs[^>]*>([\s\S]*?)<\/defs>/gi)].map((m) => m[1])
  const defs = defsContents.join('\n')

  const body = raw
    .replace(/<\?xml[^?]*\?>/gi, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, '')
    .trim()
  return { defs, body, rootFill, rootStroke }
}

function prefixSvgIds(fragment: string, prefix: string): string {
  return fragment
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/(xlink:href|href)="#([^"]+)"/g, `$1="#${prefix}$2"`)
}

interface LayerBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function rotatePoint(x: number, y: number, originX: number, originY: number, angle: number) {
  const radians = (angle * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const translatedX = x - originX
  const translatedY = y - originY

  return {
    x: translatedX * cos - translatedY * sin + originX,
    y: translatedX * sin + translatedY * cos + originY,
  }
}

function getLayerBounds(layer: RobotLayer, assetWidth: number, assetHeight: number): LayerBounds {
  const left = layer.x
  const top = layer.y
  const right = layer.x + assetWidth
  const bottom = layer.y + assetHeight

  if (layer.rotation == null) {
    return {
      minX: left,
      minY: top,
      maxX: right,
      maxY: bottom,
    }
  }

  const originX = layer.x + (layer.rotationOriginX ?? assetWidth / 2)
  const originY = layer.y + (layer.rotationOriginY ?? assetHeight / 2)
  const corners = [
    rotatePoint(left, top, originX, originY, layer.rotation),
    rotatePoint(right, top, originX, originY, layer.rotation),
    rotatePoint(right, bottom, originX, originY, layer.rotation),
    rotatePoint(left, bottom, originX, originY, layer.rotation),
  ]
  const xValues = corners.map((point) => point.x)
  const yValues = corners.map((point) => point.y)

  return {
    minX: Math.min(...xValues),
    minY: Math.min(...yValues),
    maxX: Math.max(...xValues),
    maxY: Math.max(...yValues),
  }
}

export async function composeRobotSvg(layers: RobotLayer[]) {
  const layerEntries = await Promise.all(
    layers.map(async (layer) => ({
      layer,
      asset: await getSvgAssetMeta(layer.url),
    })),
  )

  let minX: number = 0
  let minY: number = 0
  let maxX: number = ROBOT_CANVAS.width
  let maxY: number = ROBOT_CANVAS.height

  for (const entry of layerEntries) {
    const bounds = getLayerBounds(entry.layer, entry.asset.width, entry.asset.height)
    minX = Math.min(minX, bounds.minX)
    minY = Math.min(minY, bounds.minY)
    maxX = Math.max(maxX, bounds.maxX)
    maxY = Math.max(maxY, bounds.maxY)
  }

  const svgWidth = maxX - minX
  const svgHeight = maxY - minY

  const allDefs: string[] = []

  const layerMarkup = layerEntries.map(({ layer, asset }, index) => {
    const prefix = `l${index}-`
    const { defs, body, rootFill, rootStroke } = extractSvgBody(asset.raw)

    if (defs) allDefs.push(prefixSvgIds(defs, prefix))

    const translatedX = layer.x - minX
    const translatedY = layer.y - minY
    const opacity = layer.opacity != null ? ` opacity="${layer.opacity}"` : ''

    // SVG transforms apply right-to-left: rotate(local origin) then translate to canvas position.
    const transforms: string[] = [`translate(${translatedX} ${translatedY})`]
    if (layer.rotation != null) {
      const ox = layer.rotationOriginX ?? asset.width / 2
      const oy = layer.rotationOriginY ?? asset.height / 2
      transforms.push(`rotate(${layer.rotation} ${ox} ${oy})`)
    }

    const transform = ` transform="${transforms.join(' ')}"`
    // Propagate root SVG presentation attrs (e.g. fill="none") so descendants inherit them correctly
    const fillAttr = rootFill != null ? ` fill="${rootFill}"` : ''
    const strokeAttr = rootStroke != null ? ` stroke="${rootStroke}"` : ''
    return `<g${transform}${opacity}${fillAttr}${strokeAttr}>\n${prefixSvgIds(body, prefix)}\n</g>`
  })

  const defsBlock = allDefs.length > 0 ? `<defs>\n${allDefs.join('\n')}\n</defs>\n` : ''

  const svgDisplayScale = 4
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth * svgDisplayScale}" height="${svgHeight * svgDisplayScale}" viewBox="0 0 ${svgWidth} ${svgHeight}">`,
    defsBlock,
    ...layerMarkup,
    '</svg>',
  ].join('\n')
}

function sanitizeFilename(name: string) {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) {
    return 'chapse-robot'
  }
  return trimmed
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function triggerDownload(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

export async function downloadRobotSvg(layers: RobotLayer[], robotName: string) {
  const svg = await composeRobotSvg(layers)
  const fileBaseName = sanitizeFilename(robotName)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, `${fileBaseName}.svg`)
}

export async function downloadRobotPng(layers: RobotLayer[], robotName: string) {
  const svg = await composeRobotSvg(layers)
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Unable to render SVG for PNG export'))
      img.src = svgUrl
    })

    const exportWidth = image.naturalWidth || ROBOT_CANVAS.width
    const exportHeight = image.naturalHeight || ROBOT_CANVAS.height
    const scale = 20
    const canvas = document.createElement('canvas')
    canvas.width = exportWidth * scale
    canvas.height = exportHeight * scale

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas context unavailable')
    }

    context.setTransform(scale, 0, 0, scale, 0, 0)
    context.clearRect(0, 0, exportWidth, exportHeight)
    context.drawImage(image, 0, 0)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Unable to generate PNG blob'))
          return
        }
        resolve(blob)
      }, 'image/png')
    })

    const fileBaseName = sanitizeFilename(robotName)
    triggerDownload(pngBlob, `${fileBaseName}.png`)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
