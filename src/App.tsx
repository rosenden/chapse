import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode, type SyntheticEvent } from 'react'
import { CircleFlag } from 'react-circle-flags'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faFloppyDisk,
  faHandPointLeft,
  faHandPointRight,
  faHandshakeSimple,
  faMoon,
  faSun,
} from '@fortawesome/free-regular-svg-icons'
import { faGhost, faRobot, faWind } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from './components/layout'
import { SplitButton } from 'galactik-design-react/components/atoms'
import {
  Button,
  Select,
  Switch,
  Tab,
} from 'galactik-design-react/components/electrons'
import './styles/robot-playground.css'
import logoChapsvision from './assets/logo-chaspvision/logo-chapsvision-sauge.png'
import iconChapsvision from './assets/logo-chaspvision/icone-chapsvision-sauge.png'
import {
  ROBOT_CANVAS,
  ROBOT_PRESETS,
  type AssetCategory,
  type ArmMode,
  type ChapseTheme,
  type RobotLayer,
  buildRobotLayers,
  downloadRobotPng,
  downloadRobotSvg,
  ensureAssetKey,
  getAssetKeys,
} from './robot/chapse'

type ExportKind = 'idle' | 'busy' | 'success' | 'error'
type ExportFormat = 'png' | 'svg'
type Locale = 'en' | 'fr'

interface LocalizedText {
  appTitle: string
  configButton: string
  configPanelTitle: string
  closeConfig: string
  closeConfigAria: string
  saveAction: string
  saveFormatAria: string
  saveFormatsMenuAria: string
  languageAriaLabel: string
  themeLabel: string
  shadowLabel: string
  onLabel: string
  offLabel: string
  lightLabel: string
  darkLabel: string
  toggleThemeAria: (targetMode: string) => string
  toggleShadowAria: (targetState: string) => string
  headLabel: string
  eyesLabel: string
  hatLabel: string
  noHatLabel: string
  armModeAriaLabel: string
  armSplitLabel: string
  armObjectLabel: string
  leftSourceLabel: string
  leftArmLabel: string
  rightSourceLabel: string
  rightArmLabel: string
  presetAriaLabel: (presetId: string) => string
  sectionAppearance: string
  sectionFace: string
  sectionArms: string
  sectionEffects: string
}

const I18N: Record<Locale, LocalizedText> = {
  en: {
    appTitle: 'Chaps-e Generator',
    configButton: 'Configuration',
    configPanelTitle: 'Configuration',
    closeConfig: 'Close configuration',
    closeConfigAria: 'Close configuration panel',
    saveAction: 'Save',
    saveFormatAria: 'Choose save format',
    saveFormatsMenuAria: 'Save formats',
    languageAriaLabel: 'Select language',
    themeLabel: 'Theme',
    shadowLabel: 'Shadow',
    onLabel: 'On',
    offLabel: 'Off',
    lightLabel: 'Light',
    darkLabel: 'Dark',
    toggleThemeAria: (targetMode) => `Switch to ${targetMode} mode`,
    toggleShadowAria: (targetState) => `Toggle shadow ${targetState}`,
    headLabel: 'Head',
    eyesLabel: 'Eyes',
    hatLabel: 'Hat',
    noHatLabel: 'None',
    armModeAriaLabel: 'Arm mode',
    armSplitLabel: 'Custom Arms',
    armObjectLabel: 'Arm Set',
    leftSourceLabel: 'Left arm source',
    leftArmLabel: 'Left arm pose',
    rightSourceLabel: 'Right arm source',
    rightArmLabel: 'Right arm pose',
    presetAriaLabel: (presetId) => `Preset ${presetId}`,
    sectionAppearance: 'Appearance',
    sectionFace: 'Face',
    sectionArms: 'Arms',
    sectionEffects: 'Effects',
  },
  fr: {
    appTitle: 'Chaps-e Generator',
    configButton: 'Configuration',
    configPanelTitle: 'Configuration',
    closeConfig: 'Fermer la configuration',
    closeConfigAria: 'Fermer le panneau de configuration',
    saveAction: 'Sauvegarder',
    saveFormatAria: 'Choisir le format de sauvegarde',
    saveFormatsMenuAria: 'Formats de sauvegarde',
    languageAriaLabel: 'Selectionner la langue',
    themeLabel: 'Theme',
    shadowLabel: 'Ombre',
    onLabel: 'Activee',
    offLabel: 'Desactivee',
    lightLabel: 'clair',
    darkLabel: 'sombre',
    toggleThemeAria: (targetMode) => `Basculer en mode ${targetMode}`,
    toggleShadowAria: (targetState) => `Basculer l ombre ${targetState}`,
    headLabel: 'Tete',
    eyesLabel: 'Yeux',
    hatLabel: 'Chapeau',
    noHatLabel: 'Aucun',
    armModeAriaLabel: 'Mode des bras',
    armSplitLabel: 'Bras personnalises',
    armObjectLabel: 'Ensemble de bras',
    leftSourceLabel: 'Source bras gauche',
    leftArmLabel: 'Pose bras gauche',
    rightSourceLabel: 'Source bras droit',
    rightArmLabel: 'Pose bras droit',
    presetAriaLabel: (presetId) => `Preset ${presetId}`,
    sectionAppearance: 'Apparence',
    sectionFace: 'Visage',
    sectionArms: 'Bras',
    sectionEffects: 'Effets',
  },
}

const OPTION_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    default: 'Default',
    tilted: 'Tilted',
    error: 'Error',
    happy: 'Happy',
    loading: 'Loading',
    love: 'Love',
    stars: 'Stars',
    sunglasses: 'Sunglasses',
    wink: 'Wink',
    cap: 'Cap',
    cap_detective: 'Detective cap',
    hat_hard: 'Safety helmet',
    hat_wizard: 'Wizard hat',
    hate: 'Classic hat',
    arm_left: 'Left arm',
    arm_left_object: 'Left arm with object',
    arm_right: 'Right arm',
    arm_right_object: 'Right arm with object',
    hold_fist_up_side: 'Fist up (side)',
    hold_thumbs_up_side: 'Thumbs up (side)',
    hold_zen_up_side: 'Zen gesture (side)',
    rest_open_down_front: 'Rest open (front)',
    rest_open_down_side: 'Rest open (side)',
    wave_open_up_side: 'Wave open hand (side)',
    wave_point_up_side: 'Wave pointing (side)',
    key: 'Key',
    light: 'Light',
    magnifying_glass: 'Magnifying glass',
    megaphone: 'Megaphone',
    plane: 'Plane',
    spanner: 'Wrench',
    trophe: 'Trophy',
    compass: 'Compass',
    globe: 'Globe',
    ipad: 'Tablet',
    modifiable: 'Default',
    oops: 'Oops',
    target: 'Target',
    basket: 'Basket',
    pc: 'Computer',
    plant: 'Plant',
  },
  fr: {
    default: 'Defaut',
    tilted: 'Incline',
    error: 'Erreur',
    happy: 'Heureux',
    loading: 'Chargement',
    love: 'Amour',
    stars: 'Etoiles',
    sunglasses: 'Lunettes de soleil',
    wink: 'Clin d oeil',
    cap: 'Casquette',
    cap_detective: 'Casquette detective',
    hat_hard: 'Casque chantier',
    hat_wizard: 'Chapeau sorcier',
    hate: 'Chapeau classique',
    arm_left: 'Bras gauche',
    arm_left_object: 'Bras gauche avec objet',
    arm_right: 'Bras droit',
    arm_right_object: 'Bras droit avec objet',
    hold_fist_up_side: 'Poing leve (profil)',
    hold_thumbs_up_side: 'Pouce leve (profil)',
    hold_zen_up_side: 'Geste zen (profil)',
    rest_open_down_front: 'Repos main ouverte (face)',
    rest_open_down_side: 'Repos main ouverte (profil)',
    wave_open_up_side: 'Salut main ouverte (profil)',
    wave_point_up_side: 'Salut doigt leve (profil)',
    key: 'Cle',
    light: 'Lampe',
    magnifying_glass: 'Loupe',
    megaphone: 'Megaphone',
    plane: 'Avion',
    spanner: 'Cle a molette',
    trophe: 'Trophee',
    compass: 'Boussole',
    globe: 'Globe',
    ipad: 'Tablette',
    modifiable: 'Standard',
    oops: 'Oups',
    target: 'Cible',
    basket: 'Panier',
    pc: 'Ordinateur',
    plant: 'Plante',
  },
}

function humanizeToken(value: string) {
  return value.replace(/_/g, ' ')
}

function localizeOptionLabel(locale: Locale, value: string) {
  return OPTION_LABELS[locale][value] ?? humanizeToken(value)
}

interface AppHeaderProps {
  locale: Locale
  text: LocalizedText
  onLocaleChange: (locale: Locale) => void
}

interface AssetSize {
  width: number
  height: number
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

function getLayerBounds(layer: RobotLayer, size: AssetSize): LayerBounds {
  const left = layer.x
  const top = layer.y
  const right = layer.x + size.width
  const bottom = layer.y + size.height

  if (layer.rotation == null) {
    return { minX: left, minY: top, maxX: right, maxY: bottom }
  }

  const originX = layer.x + (layer.rotationOriginX ?? size.width / 2)
  const originY = layer.y + (layer.rotationOriginY ?? size.height / 2)
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

function SaveDiskIcon() {
  return <FontAwesomeIcon icon={faFloppyDisk} className="rg-save-icon" aria-hidden="true" />
}

function IconSun() {
  return <FontAwesomeIcon icon={faSun} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconMoon() {
  return <FontAwesomeIcon icon={faMoon} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconFace() {
  return <FontAwesomeIcon icon={faRobot} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconArms() {
  return <FontAwesomeIcon icon={faHandshakeSimple} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconEffects() {
  return <FontAwesomeIcon icon={faWind} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconShadow() {
  return <FontAwesomeIcon icon={faGhost} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconLeftArm() {
  return <FontAwesomeIcon icon={faHandPointLeft} className="rg-ctrl-icon" aria-hidden="true" />
}

function IconRightArm() {
  return <FontAwesomeIcon icon={faHandPointRight} className="rg-ctrl-icon" aria-hidden="true" />
}

function SectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rg-section-title" aria-hidden="true">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function AppHeader({ locale, text, onLocaleChange }: AppHeaderProps) {
  const currentLocaleFlag = locale === 'fr' ? 'fr' : 'gb'
  const languageOptions = useMemo(
    () => [
      {
        value: 'en',
        label: 'English',
        icon: <CircleFlag countryCode="gb" height={14} aria-hidden />,
      },
      {
        value: 'fr',
        label: 'Français',
        icon: <CircleFlag countryCode="fr" height={14} aria-hidden />,
      },
    ],
    [],
  )

  return (
    <div className="rg-header">
      <picture className="rg-brand-picture">
        <source media="(min-width: 560px)" srcSet={logoChapsvision} />
        <img className="rg-brand" src={iconChapsvision} alt="ChapsVision" />
      </picture>
      <span className="rg-header-separator" aria-hidden="true" />
      <span className="rg-title">{text.appTitle}</span>
      <div className="rg-header-actions">
        <div className="rg-language-wrap">
          <span className="rg-language-current-flag" aria-hidden="true">
            <CircleFlag countryCode={currentLocaleFlag} height={14} aria-hidden />
          </span>
          <Select
            className="rg-language-select"
            size="sm"
            options={languageOptions}
            value={locale}
            aria-label={text.languageAriaLabel}
            onChange={(value: string) => onLocaleChange(value === 'fr' ? 'fr' : 'en')}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const ROBOT_NAME = 'Chaps-e'
  const [locale, setLocale] = useState<Locale>('en')
  const [theme, setTheme] = useState<ChapseTheme>('light')
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('01')
  const [armMode, setArmMode] = useState<ArmMode>('split')
  const [head, setHead] = useState(() => ensureAssetKey('light', 'head', 'default'))
  const [eyes, setEyes] = useState(() => ensureAssetKey('light', 'eyes', 'default'))
  const [hat, setHat] = useState<string>('')
  const [leftSource, setLeftSource] = useState<'arm_left' | 'arm_left_object'>('arm_left')
  const [rightSource, setRightSource] = useState<'arm_right' | 'arm_right_object'>('arm_right')
  const [leftAsset, setLeftAsset] = useState(() => ensureAssetKey('light', 'arm_left', null))
  const [rightAsset, setRightAsset] = useState(() => ensureAssetKey('light', 'arm_right', null))
  const [armsObject, setArmsObject] = useState(() => ensureAssetKey('light', 'arms_object', null))
  const [showShadow, setShowShadow] = useState(false)
  const [exportKind, setExportKind] = useState<ExportKind>('idle')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [assetSizes, setAssetSizes] = useState<Record<string, AssetSize>>({})
  const stageExportRef = useRef<HTMLDivElement | null>(null)
  const text = I18N[locale]

  useEffect(() => {
    if (!exportMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (stageExportRef.current?.contains(event.target as Node)) {
        return
      }
      setExportMenuOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [exportMenuOpen])

  useEffect(() => {
    if (!mobileConfigOpen) {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 879px)')
    if (!mediaQuery.matches) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileConfigOpen])

  useEffect(() => {
    if (!mobileConfigOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileConfigOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mobileConfigOpen])

  const headOptions = useMemo(
    () =>
      getAssetKeys(theme, 'head').map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, locale],
  )
  const eyesOptions = useMemo(
    () =>
      getAssetKeys(theme, 'eyes').map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, locale],
  )
  const hatAssetOptions = useMemo(
    () =>
      getAssetKeys(theme, 'hat').map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, locale],
  )
  const hatOptions = useMemo(
    () => [{ value: '', label: text.noHatLabel }, ...hatAssetOptions],
    [hatAssetOptions, text.noHatLabel],
  )
  const leftOptions = useMemo(
    () =>
      getAssetKeys(theme, leftSource as AssetCategory).map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, leftSource, locale],
  )
  const rightOptions = useMemo(
    () =>
      getAssetKeys(theme, rightSource as AssetCategory).map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, rightSource, locale],
  )
  const armsObjectOptions = useMemo(
    () =>
      getAssetKeys(theme, 'arms_object').map((value) => ({
        value,
        label: localizeOptionLabel(locale, value),
      })),
    [theme, locale],
  )
  const leftSourceOptions = useMemo(
    () => [
      { value: 'arm_left', label: localizeOptionLabel(locale, 'arm_left') },
      { value: 'arm_left_object', label: localizeOptionLabel(locale, 'arm_left_object') },
    ],
    [locale],
  )
  const rightSourceOptions = useMemo(
    () => [
      { value: 'arm_right', label: localizeOptionLabel(locale, 'arm_right') },
      { value: 'arm_right_object', label: localizeOptionLabel(locale, 'arm_right_object') },
    ],
    [locale],
  )

  const safeHead = useMemo(() => ensureAssetKey(theme, 'head', head), [theme, head])
  const safeEyes = useMemo(() => ensureAssetKey(theme, 'eyes', eyes), [theme, eyes])
  const safeHat = useMemo(() => (hat ? ensureAssetKey(theme, 'hat', hat) : ''), [theme, hat])
  const safeLeftAsset = useMemo(
    () => ensureAssetKey(theme, leftSource, leftAsset),
    [theme, leftSource, leftAsset],
  )
  const safeRightAsset = useMemo(
    () => ensureAssetKey(theme, rightSource, rightAsset),
    [theme, rightSource, rightAsset],
  )
  const safeArmsObject = useMemo(
    () => ensureAssetKey(theme, 'arms_object', armsObject),
    [theme, armsObject],
  )
  const currentConfig = useMemo(
    () => ({
      head: safeHead,
      eyes: safeEyes,
      hat: safeHat,
      showShadow,
      armMode,
      leftSource,
      leftAsset: safeLeftAsset,
      rightSource,
      rightAsset: safeRightAsset,
      armsObject: safeArmsObject,
    }),
    [
      safeHead,
      safeEyes,
      safeHat,
      showShadow,
      armMode,
      leftSource,
      safeLeftAsset,
      rightSource,
      safeRightAsset,
      safeArmsObject,
    ],
  )

  useEffect(() => {
    if (!selectedPresetId) {
      return
    }

    const preset = ROBOT_PRESETS.find((entry) => entry.id === selectedPresetId)
    if (!preset) {
      setSelectedPresetId('')
      return
    }

    const matchesSelectedPreset =
      preset.config.head === currentConfig.head &&
      preset.config.eyes === currentConfig.eyes &&
      preset.config.hat === currentConfig.hat &&
      (preset.config.showShadow ?? false) === currentConfig.showShadow &&
      preset.config.armMode === currentConfig.armMode &&
      preset.config.leftSource === currentConfig.leftSource &&
      preset.config.leftAsset === currentConfig.leftAsset &&
      preset.config.rightSource === currentConfig.rightSource &&
      preset.config.rightAsset === currentConfig.rightAsset &&
      preset.config.armsObject === currentConfig.armsObject

    if (!matchesSelectedPreset) {
      setSelectedPresetId('')
    }
  }, [selectedPresetId, currentConfig])

  const robotLayers = useMemo(
    () =>
      buildRobotLayers({
        theme,
        head: currentConfig.head,
        eyes: currentConfig.eyes,
        hat: currentConfig.hat,
        showShadow: currentConfig.showShadow,
        armMode: currentConfig.armMode,
        leftSource: currentConfig.leftSource,
        leftAsset: currentConfig.leftAsset,
        rightSource: currentConfig.rightSource,
        rightAsset: currentConfig.rightAsset,
        armsObject: currentConfig.armsObject,
      }),
    [theme, currentConfig],
  )
  const previewBounds = useMemo(() => {
    let minX: number = 0
    let minY: number = 0
    let maxX: number = ROBOT_CANVAS.width
    let maxY: number = ROBOT_CANVAS.height

    for (const layer of robotLayers) {
      const size = assetSizes[layer.url]
      if (!size) {
        continue
      }

      const bounds = getLayerBounds(layer, size)
      minX = Math.min(minX, bounds.minX)
      minY = Math.min(minY, bounds.minY)
      maxX = Math.max(maxX, bounds.maxX)
      maxY = Math.max(maxY, bounds.maxY)
    }

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }, [robotLayers, assetSizes])
  const previewShellStyle = useMemo(
    () => ({
      width: `calc(${previewBounds.width}px * var(--preview-scale))`,
      height: `calc(${previewBounds.height}px * var(--preview-scale))`,
    }),
    [previewBounds.width, previewBounds.height],
  )
  const previewCanvasStyle = useMemo(
    () => ({
      width: `${previewBounds.width}px`,
      height: `${previewBounds.height}px`,
    }),
    [previewBounds.width, previewBounds.height],
  )
  const themeStateLabel = theme === 'dark' ? text.darkLabel : text.lightLabel
  const themeTargetLabel = theme === 'light' ? text.darkLabel : text.lightLabel
  const shadowStateLabel = showShadow ? text.onLabel : text.offLabel
  const shadowTargetLabel = showShadow ? text.offLabel : text.onLabel

  function handleLayerLoad(event: SyntheticEvent<HTMLImageElement>) {
    const target = event.currentTarget
    const layerUrl = target.dataset.layerUrl ?? target.currentSrc
    if (!layerUrl) {
      return
    }

    const width = target.naturalWidth
    const height = target.naturalHeight
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return
    }

    setAssetSizes((previous) => {
      const existing = previous[layerUrl]
      if (existing && existing.width === width && existing.height === height) {
        return previous
      }

      return {
        ...previous,
        [layerUrl]: { width, height },
      }
    })
  }

  function handleHeadChange(value: string) {
    setHead(value)
  }

  function handleEyesChange(value: string) {
    setEyes(value)
  }

  function handleLeftSourceChange(value: string) {
    const nextSource = value as 'arm_left' | 'arm_left_object'
    setLeftSource(nextSource)
    setLeftAsset((previous) => ensureAssetKey(theme, nextSource, previous))
  }

  function handleRightSourceChange(value: string) {
    const nextSource = value as 'arm_right' | 'arm_right_object'
    setRightSource(nextSource)
    setRightAsset((previous) => ensureAssetKey(theme, nextSource, previous))
  }

  function applyPreset(presetId: string) {
    const preset = ROBOT_PRESETS.find((entry) => entry.id === presetId)
    if (!preset) {
      return
    }

    setHead(ensureAssetKey(theme, 'head', preset.config.head))
    setEyes(ensureAssetKey(theme, 'eyes', preset.config.eyes))
    setHat(preset.config.hat)
    setArmMode(preset.config.armMode)
    setLeftSource(preset.config.leftSource)
    setRightSource(preset.config.rightSource)
    setLeftAsset(ensureAssetKey(theme, preset.config.leftSource, preset.config.leftAsset))
    setRightAsset(ensureAssetKey(theme, preset.config.rightSource, preset.config.rightAsset))
    setArmsObject(ensureAssetKey(theme, 'arms_object', preset.config.armsObject))
    setShowShadow(preset.config.showShadow ?? false)
    setSelectedPresetId(preset.id)
  }

  async function onExport(format: ExportFormat) {
    setExportKind('busy')
    try {
      if (format === 'png') {
        await downloadRobotPng(robotLayers, ROBOT_NAME)
      } else {
        await downloadRobotSvg(robotLayers, ROBOT_NAME)
      }
    } catch {
      // Keep silent for now: no export status message is displayed in the UI.
    } finally {
      setExportKind('idle')
    }
  }

  function handleExportSelection(format: ExportFormat) {
    setExportFormat(format)
    setExportMenuOpen(false)
    void onExport(format)
  }

  return (
    <AppShell
      sidebarMode="none"
      header={
        <AppHeader
          locale={locale}
          text={text}
          onLocaleChange={setLocale}
        />
      }
      theme={theme}
    >
      <section className="rg-workspace">
        <article className="rg-stage">
          <div className={`rg-stage-surface rg-stage-surface--${theme}`}>
            <div className="rg-presets rg-presets--overlay">
              {ROBOT_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  className="rg-preset-button"
                  variant={selectedPresetId === preset.id ? 'primary' : 'secondary'}
                  size="md"
                  aria-label={text.presetAriaLabel(preset.id)}
                  onClick={() => applyPreset(preset.id)}
                >
                  <span className="rg-preset-icon" aria-hidden="true">
                    {preset.label}
                  </span>
                </Button>
              ))}
            </div>
            <div className="rg-export-floating" ref={stageExportRef}>
              <SplitButton
                variant="accent"
                size="md"
                disabled={exportKind === 'busy'}
                chevronOpen={exportMenuOpen}
                chevronAriaLabel={text.saveFormatAria}
                onAction={() => setExportMenuOpen((value: boolean) => !value)}
                onChevron={() => setExportMenuOpen((value: boolean) => !value)}
              >
                <span className="rg-save-label">
                  <SaveDiskIcon />
                  <span>{text.saveAction}</span>
                </span>
              </SplitButton>

              {exportMenuOpen && (
                <div className="rg-export-menu" role="menu" aria-label={text.saveFormatsMenuAria}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={exportFormat === 'png'}
                    className={`rg-export-option ${exportFormat === 'png' ? 'rg-export-option--active' : ''}`}
                    onClick={() => handleExportSelection('png')}
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={exportFormat === 'svg'}
                    className={`rg-export-option ${exportFormat === 'svg' ? 'rg-export-option--active' : ''}`}
                    onClick={() => handleExportSelection('svg')}
                  >
                    SVG
                  </button>
                </div>
              )}
            </div>

            <div className="rg-canvas-shell" style={previewShellStyle}>
              <div className="rg-canvas" style={previewCanvasStyle}>
                {robotLayers.map((layer) => (
                  <img
                    key={layer.id}
                    className="rg-layer"
                    src={layer.url}
                    data-layer-url={layer.url}
                    alt=""
                    aria-hidden="true"
                    onLoad={handleLayerLoad}
                    style={{
                      left: `${layer.x - previewBounds.minX}px`,
                      top: `${layer.y - previewBounds.minY}px`,
                      opacity: layer.opacity ?? 1,
                      transform: layer.rotation != null ? `rotate(${layer.rotation}deg)` : undefined,
                      transformOrigin:
                        layer.rotation != null
                          ? `${layer.rotationOriginX ?? 0}px ${layer.rotationOriginY ?? 0}px`
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>

        <button
          type="button"
          className={`rg-mobile-config-trigger${mobileConfigOpen ? ' rg-mobile-config-trigger--hidden' : ''}`}
          onClick={() => setMobileConfigOpen(true)}
        >
          {text.configButton}
        </button>

        <button
          type="button"
          aria-label={text.closeConfigAria}
          className={`rg-mobile-drawer-backdrop${mobileConfigOpen ? ' rg-mobile-drawer-backdrop--open' : ''}`}
          onClick={() => setMobileConfigOpen(false)}
        />

        <article className={`rg-controls${mobileConfigOpen ? ' rg-controls--mobile-open' : ''}`}>
          <div className="rg-controls-mobile-head">
            <h2 className="rg-controls-mobile-title">{text.configPanelTitle}</h2>
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              icon={<FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />}
              className="rg-controls-mobile-close"
              aria-label={text.closeConfigAria}
              onClick={() => setMobileConfigOpen(false)}
            />
          </div>
          <div className="rg-controls-content">
            <div className="rg-control-grid">
              <div className="rg-control-section">
                <SectionTitle icon={theme === 'dark' ? <IconMoon /> : <IconSun />} label={text.sectionAppearance} />
                <div className="rg-theme-switch-row">
                  <span className="rg-theme-switch-label">
                    {text.themeLabel} — {themeStateLabel}
                  </span>
                  <Switch
                    size="small"
                    checked={theme === 'dark'}
                    aria-label={text.toggleThemeAria(themeTargetLabel)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setTheme(event.target.checked ? 'dark' : 'light')
                    }
                  />
                </div>
              </div>

              <div className="rg-control-section">
                <SectionTitle icon={<IconFace />} label={text.sectionFace} />
                <Select
                  label={text.headLabel}
                  size="md"
                  options={headOptions}
                  value={safeHead}
                  onChange={handleHeadChange}
                />

                <Select
                  label={text.eyesLabel}
                  size="md"
                  options={eyesOptions}
                  value={safeEyes}
                  onChange={handleEyesChange}
                />

                <Select
                  label={text.hatLabel}
                  size="md"
                  options={hatOptions}
                  value={safeHat}
                  onChange={setHat}
                />
              </div>

              <div className="rg-control-section rg-control-section--arms">
                <SectionTitle icon={<IconArms />} label={text.sectionArms} />
                <div className="rg-arm-mode-tabs" role="tablist" aria-label={text.armModeAriaLabel}>
                  <Tab
                    variant="secondary"
                    size="md"
                    active={armMode === 'split'}
                    onClick={() => setArmMode('split')}
                  >
                    {text.armSplitLabel}
                  </Tab>
                  <Tab
                    variant="secondary"
                    size="md"
                    active={armMode === 'arms_object'}
                    onClick={() => setArmMode('arms_object')}
                  >
                    {text.armObjectLabel}
                  </Tab>
                </div>

                {armMode === 'split' ? (
                  <>
                    <div className="rg-arm-group">
                      <div className="rg-arm-group-header">
                        <IconLeftArm />
                        <span className="rg-arm-group-label">{text.leftSourceLabel}</span>
                      </div>
                      <Select
                        size="md"
                        options={leftSourceOptions}
                        value={leftSource}
                        onChange={handleLeftSourceChange}
                      />
                      <Select
                        label={text.leftArmLabel}
                        size="md"
                        options={leftOptions}
                        value={safeLeftAsset}
                        onChange={setLeftAsset}
                      />
                    </div>

                    <div className="rg-arm-group">
                      <div className="rg-arm-group-header">
                        <IconRightArm />
                        <span className="rg-arm-group-label">{text.rightSourceLabel}</span>
                      </div>
                      <Select
                        size="md"
                        options={rightSourceOptions}
                        value={rightSource}
                        onChange={handleRightSourceChange}
                      />
                      <Select
                        label={text.rightArmLabel}
                        size="md"
                        options={rightOptions}
                        value={safeRightAsset}
                        onChange={setRightAsset}
                      />
                    </div>
                  </>
                ) : (
                  <Select
                    label={text.armObjectLabel}
                    size="md"
                    options={armsObjectOptions}
                    value={safeArmsObject}
                    onChange={setArmsObject}
                  />
                )}
              </div>

              <div className="rg-control-section">
                <SectionTitle icon={<IconEffects />} label={text.sectionEffects} />
                <div className="rg-theme-switch-row">
                  <span className="rg-theme-switch-label rg-theme-switch-label--with-icon">
                    <IconShadow />
                    {text.shadowLabel} — {shadowStateLabel}
                  </span>
                  <Switch
                    size="small"
                    checked={showShadow}
                    aria-label={text.toggleShadowAria(shadowTargetLabel)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setShowShadow(event.target.checked)}
                  />
                </div>
              </div>
            </div>
            <div className="rg-controls-mobile-footer">
              <Button
                size="md"
                variant="secondary"
                className="rg-controls-mobile-close-action"
                onClick={() => setMobileConfigOpen(false)}
              >
                {text.closeConfig}
              </Button>
            </div>
            <div className="rg-controls-endmark" aria-hidden="true">
              <img className="rg-controls-endmark-logo" src={iconChapsvision} alt="" />
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  )
}
