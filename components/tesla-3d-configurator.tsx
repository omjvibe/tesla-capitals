'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  RotateCcw,
  Sparkles,
  Zap,
  Rocket,
  Sun,
  Eye,
  Maximize2,
  Camera,
  Layers,
  Flame,
  Check,
  Volume2,
  VolumeX,
  Gauge,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

export interface ColorOption {
  id: string
  name: string
  hex: string
  category: string
  description: string
  finish: string
}

export const TESLA_COLORS: ColorOption[] = [
  {
    id: 'ultra-red',
    name: 'Ultra Red',
    hex: '#b81414',
    category: 'Signature Multi-Coat',
    description: 'High-chroma multi-layer automotive coat that shifts with angle and ambient illumination.',
    finish: 'Deep Metallic Clearcoat',
  },
  {
    id: 'solid-black',
    name: 'Solid Black',
    hex: '#0b0c10',
    category: 'Monochrome Stealth',
    description: 'Ultra-deep obsidian black absorbing ambient reflection for an uncompromising silhouette.',
    finish: 'Ultra High Gloss',
  },
  {
    id: 'pearl-white',
    name: 'Pearl White Multi-Coat',
    hex: '#f2f4f8',
    category: 'Ceramic Multi-Coat',
    description: 'Pearlescent metallic white infused with ceramic flake for a brilliant aerospace finish.',
    finish: 'Ceramic Pearlescent',
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue Metallic',
    hex: '#0a307a',
    category: 'Metallic Series',
    description: 'Rich cobalt blue reflecting deep indigo in shade and vibrant electric azure in studio light.',
    finish: 'High-Depth Metallic',
  },
  {
    id: 'quicksilver',
    name: 'Quicksilver',
    hex: '#8e939a',
    category: 'Liquid Metal',
    description: 'Dynamic liquid-metal silver developed in Berlin Gigafactory advanced paint shop.',
    finish: 'Liquid Metal Luster',
  },
  {
    id: 'stealth-grey',
    name: 'Stealth Grey',
    hex: '#2e3037',
    category: 'Exoskeleton Matte',
    description: 'Dark titanium grey engineered to highlight the aerodynamic muscle of the rear haunches.',
    finish: 'Satin Clearcoat',
  },
  {
    id: 'cyber-bronze',
    name: 'Cyber Bronze',
    hex: '#5a3a25',
    category: 'Founders Edition',
    description: 'Exclusive anodized aerospace bronze reserved for SpaceX Founders Series reservations.',
    finish: 'Anodized Metallic',
  },
]

export type CameraPreset = 'hero' | 'side' | 'rear' | 'top' | 'cockpit'

export function Tesla3DConfigurator({
  initialColor = 'ultra-red',
  className = '',
  embedded = false,
}: {
  initialColor?: string
  className?: string
  embedded?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    () => TESLA_COLORS.find((c) => c.id === initialColor) || TESLA_COLORS[0]
  )
  const [thrustersActive, setThrustersActive] = useState(false)
  const [lightsActive, setLightsActive] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [suspensionMode, setSuspensionMode] = useState<'track' | 'standard' | 'hover'>('standard')
  const [activePreset, setActivePreset] = useState<CameraPreset>('hero')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [fps, setFps] = useState(60)

  // Three.js object references held in ref for animation frame access
  const threeRefs = useRef<{
    scene?: THREE.Scene
    camera?: THREE.PerspectiveCamera
    renderer?: THREE.WebGLRenderer
    controls?: OrbitControls
    carGroup?: THREE.Group
    bodyMaterials: THREE.MeshPhysicalMaterial[]
    headlightMeshes: THREE.Mesh[]
    taillightMeshes: THREE.Mesh[]
    headlightLights: THREE.SpotLight[]
    taillightLights: THREE.PointLight[]
    thrusterLight?: THREE.PointLight
    thrusterParticles?: THREE.Points
    particleVelocities?: Float32Array
    wheelMeshes: THREE.Group[]
    turntableRing?: THREE.Mesh
    targetSuspensionY: number
    currentSuspensionY: number
    animationFrameId?: number
    soundAudio?: HTMLAudioElement | null
  }>({
    bodyMaterials: [],
    headlightMeshes: [],
    taillightMeshes: [],
    headlightLights: [],
    taillightLights: [],
    wheelMeshes: [],
    targetSuspensionY: 0,
    currentSuspensionY: 0,
  })

  // Color change effect
  useEffect(() => {
    const hex = selectedColor.hex
    threeRefs.current.bodyMaterials.forEach((mat) => {
      mat.color.setStyle(hex)
    })
  }, [selectedColor])

  // Wireframe toggle
  useEffect(() => {
    threeRefs.current.bodyMaterials.forEach((mat) => {
      mat.wireframe = wireframeMode
    })
  }, [wireframeMode])

  // Lights toggle
  useEffect(() => {
    const refs = threeRefs.current
    refs.headlightLights.forEach((light) => {
      light.intensity = lightsActive ? 4.5 : 0
    })
    refs.taillightLights.forEach((light) => {
      light.intensity = lightsActive ? 2.5 : 0
    })
    refs.headlightMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color.setStyle(lightsActive ? '#ffffff' : '#333333')
    })
    refs.taillightMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color.setStyle(lightsActive ? '#ff1515' : '#440505')
    })
  }, [lightsActive])

  // Suspension height update
  useEffect(() => {
    let target = 0
    if (suspensionMode === 'track') target = -0.06
    else if (suspensionMode === 'hover' || thrustersActive) target = 0.22
    else target = 0
    threeRefs.current.targetSuspensionY = target
  }, [suspensionMode, thrustersActive])

  // Thruster activation effect
  const toggleThrusters = useCallback(() => {
    setThrustersActive((prev) => {
      const next = !prev
      if (next) {
        setSuspensionMode('hover')
      } else {
        setSuspensionMode('standard')
      }
      return next
    })
  }, [])

  // Camera presets
  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    setActivePreset(preset)
    const camera = threeRefs.current.camera
    const controls = threeRefs.current.controls
    if (!camera || !controls) return

    const targets: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
      hero: { pos: [3.8, 1.6, 4.2], look: [0, 0.4, 0] },
      side: { pos: [5.2, 0.8, 0], look: [0, 0.4, 0] },
      rear: { pos: [-0.2, 1.2, -4.8], look: [0, 0.4, 0] },
      top: { pos: [0.01, 7.5, 0.01], look: [0, 0, 0] },
      cockpit: { pos: [1.2, 1.5, 1.4], look: [0, 0.5, 0.2] },
    }

    const t = targets[preset]
    camera.position.set(...t.pos)
    controls.target.set(...t.look)
    controls.update()
  }, [])

  // Auto-rotate effect
  useEffect(() => {
    if (threeRefs.current.controls) {
      threeRefs.current.controls.autoRotate = autoRotate
    }
  }, [autoRotate])

  // Mount Three.js Scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 520

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x06070a)
    scene.fog = new THREE.FogExp2(0x06070a, 0.04)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(3.8, 1.6, 4.2)

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2.8
    controls.maxDistance = 10.0
    controls.maxPolarAngle = Math.PI / 2 - 0.02
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.0
    controls.target.set(0, 0.45, 0)
    controls.update()

    // 5. Studio Lighting
    // Ambient soft illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Key front-three-quarter light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
    keyLight.position.set(4, 6, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 25
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    // Cool rim light (highlights aerodynamic curves)
    const rimLight = new THREE.DirectionalLight(0x73a8ff, 2.2)
    rimLight.position.set(-5, 4, -5)
    scene.add(rimLight)

    // Top softbox fill light
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2)
    topLight.position.set(0, 8, 0)
    scene.add(topLight)

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0x223344, 0.8)
    bounceLight.position.set(0, -3, 0)
    scene.add(bounceLight)

    // 6. Turntable Pedestal
    const pedestalGroup = new THREE.Group()

    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.15, 64)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x101217,
      roughness: 0.4,
      metalness: 0.8,
    })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = -0.075
    baseMesh.receiveShadow = true
    pedestalGroup.add(baseMesh)

    // Inner turntable platform with dark brushed finish
    const platformGeo = new THREE.CylinderGeometry(3.4, 3.4, 0.02, 64)
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d11,
      roughness: 0.25,
      metalness: 0.9,
    })
    const platformMesh = new THREE.Mesh(platformGeo, platformMat)
    platformMesh.position.y = 0.01
    platformMesh.receiveShadow = true
    pedestalGroup.add(platformMesh)

    // Glowing LED perimeter accent ring
    const ringGeo = new THREE.TorusGeometry(3.41, 0.018, 16, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe82127 })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2
    ringMesh.position.y = 0.015
    pedestalGroup.add(ringMesh)

    // Concentric studio floor markings
    const ringGeo2 = new THREE.TorusGeometry(2.2, 0.008, 16, 64)
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x222630 })
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2)
    ringMesh2.rotation.x = Math.PI / 2
    ringMesh2.position.y = 0.012
    pedestalGroup.add(ringMesh2)

    // Contact shadow beneath car
    const shadowGeo = new THREE.PlaneGeometry(4.6, 2.4)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = 0.018
    pedestalGroup.add(shadowMesh)

    scene.add(pedestalGroup)

    // 7. BUILD PROCEDURAL HIGH-FIDELITY TESLA ROADSTER 3D MODEL
    const carRoot = new THREE.Group()
    carRoot.position.y = 0 // Base ground position

    const bodyMaterials: THREE.MeshPhysicalMaterial[] = []
    const headlightMeshes: THREE.Mesh[] = []
    const taillightMeshes: THREE.Mesh[] = []
    const headlightLights: THREE.SpotLight[] = []
    const taillightLights: THREE.PointLight[] = []
    const wheelMeshes: THREE.Group[] = []

    // Primary Body Paint Material (Physical Automotive Clearcoat)
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedColor.hex),
      metalness: 0.85,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
      envMapIntensity: 1.4,
    })
    bodyMaterials.push(bodyPaintMat)

    // Carbon Fiber Trim Material
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x121316,
      roughness: 0.35,
      metalness: 0.7,
    })

    // Gloss Black Trim Material
    const glossBlackMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.15,
      metalness: 0.9,
    })

    // Tinted Glass Canopy Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a101d,
      metalness: 0.1,
      roughness: 0.04,
      transmission: 0.65,
      opacity: 0.65,
      transparent: true,
      ior: 1.52,
    })

    // --- A. Main Chassis / Fuselage Body ---
    const chassisGroup = new THREE.Group()

    // 1. Lower Fuselage Core
    const fuselageGeo = new THREE.BoxGeometry(1.82, 0.34, 4.1)
    const fuselageMesh = new THREE.Mesh(fuselageGeo, bodyPaintMat)
    fuselageMesh.position.set(0, 0.36, 0)
    fuselageMesh.castShadow = true
    fuselageMesh.receiveShadow = true
    chassisGroup.add(fuselageMesh)

    // 2. Sculpted Front Hood (Sleek nose-dip rake)
    const hoodGeo = new THREE.BoxGeometry(1.72, 0.16, 1.5)
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyPaintMat)
    hoodMesh.position.set(0, 0.44, 1.25)
    hoodMesh.rotation.x = -0.1
    hoodMesh.castShadow = true
    chassisGroup.add(hoodMesh)

    // 3. Aerodynamic Front Nose Cone Splitter (Aggressive shark-nose)
    const noseGeo = new THREE.BoxGeometry(1.64, 0.18, 0.65)
    const noseMesh = new THREE.Mesh(noseGeo, bodyPaintMat)
    noseMesh.position.set(0, 0.32, 2.05)
    noseMesh.castShadow = true
    chassisGroup.add(noseMesh)

    // Front Carbon Fiber Lip Splitter
    const frontSplitterGeo = new THREE.BoxGeometry(1.76, 0.04, 0.5)
    const frontSplitterMesh = new THREE.Mesh(frontSplitterGeo, carbonMat)
    frontSplitterMesh.position.set(0, 0.19, 2.12)
    frontSplitterMesh.castShadow = true
    chassisGroup.add(frontSplitterMesh)

    // 4. Rear Muscular Haunches (Wide aero shoulders)
    const leftHaunchGeo = new THREE.BoxGeometry(0.3, 0.28, 1.6)
    const leftHaunch = new THREE.Mesh(leftHaunchGeo, bodyPaintMat)
    leftHaunch.position.set(0.92, 0.46, -0.9)
    leftHaunch.castShadow = true
    chassisGroup.add(leftHaunch)

    const rightHaunch = new THREE.Mesh(leftHaunchGeo, bodyPaintMat)
    rightHaunch.position.set(-0.92, 0.46, -0.9)
    rightHaunch.castShadow = true
    chassisGroup.add(rightHaunch)

    // Front Fender Flares
    const leftFrontFenderGeo = new THREE.BoxGeometry(0.24, 0.26, 1.3)
    const leftFrontFender = new THREE.Mesh(leftFrontFenderGeo, bodyPaintMat)
    leftFrontFender.position.set(0.88, 0.42, 1.15)
    leftFrontFender.castShadow = true
    chassisGroup.add(leftFrontFender)

    const rightFrontFender = new THREE.Mesh(leftFrontFenderGeo, bodyPaintMat)
    rightFrontFender.position.set(-0.88, 0.42, 1.15)
    rightFrontFender.castShadow = true
    chassisGroup.add(rightFrontFender)

    // Aerodynamic Side Skirts
    const sideSkirtGeo = new THREE.BoxGeometry(0.12, 0.08, 2.2)
    const leftSkirt = new THREE.Mesh(sideSkirtGeo, carbonMat)
    leftSkirt.position.set(0.96, 0.21, 0.05)
    leftSkirt.castShadow = true
    chassisGroup.add(leftSkirt)

    const rightSkirt = new THREE.Mesh(sideSkirtGeo, carbonMat)
    rightSkirt.position.set(-0.96, 0.21, 0.05)
    rightSkirt.castShadow = true
    chassisGroup.add(rightSkirt)

    // 5. Rear Deck & Active Integrated Ducktail Spoiler
    const rearDeckGeo = new THREE.BoxGeometry(1.68, 0.22, 1.1)
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyPaintMat)
    rearDeck.position.set(0, 0.52, -1.5)
    rearDeck.castShadow = true
    chassisGroup.add(rearDeck)

    // Active Carbon Fiber Spoiler Blade
    const spoilerGeo = new THREE.BoxGeometry(1.64, 0.04, 0.28)
    const spoilerMesh = new THREE.Mesh(spoilerGeo, carbonMat)
    spoilerMesh.position.set(0, 0.64, -2.02)
    spoilerMesh.rotation.x = -0.15
    spoilerMesh.castShadow = true
    chassisGroup.add(spoilerMesh)

    // 6. Rear High-Downforce Aero Diffuser with Strakes
    const diffuserGeo = new THREE.BoxGeometry(1.68, 0.16, 0.65)
    const diffuserMesh = new THREE.Mesh(diffuserGeo, carbonMat)
    diffuserMesh.position.set(0, 0.22, -1.95)
    diffuserMesh.rotation.x = 0.14
    diffuserMesh.castShadow = true
    chassisGroup.add(diffuserMesh)

    // 4 Diffuser Strakes (Aero Fins)
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue
      const strakeGeo = new THREE.BoxGeometry(0.03, 0.14, 0.55)
      const strakeMesh = new THREE.Mesh(strakeGeo, glossBlackMat)
      strakeMesh.position.set(i * 0.32, 0.18, -1.98)
      chassisGroup.add(strakeMesh)
    }

    // --- B. Glass Canopy (Aerodynamic Panoramic Bubble) ---
    const canopyGroup = new THREE.Group()

    // Windshield & Roof Glass
    const glassRoofGeo = new THREE.BoxGeometry(1.36, 0.42, 1.95)
    const glassRoofMesh = new THREE.Mesh(glassRoofGeo, glassMat)
    glassRoofMesh.position.set(0, 0.72, -0.05)
    glassRoofMesh.castShadow = true
    canopyGroup.add(glassRoofMesh)

    // Windshield Slope (Front rake)
    const windshieldGeo = new THREE.BoxGeometry(1.32, 0.1, 0.85)
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat)
    windshieldMesh.position.set(0, 0.68, 0.82)
    windshieldMesh.rotation.x = -0.52
    canopyGroup.add(windshieldMesh)

    // Rear Fastback Hatch Slope
    const rearGlassGeo = new THREE.BoxGeometry(1.3, 0.08, 0.95)
    const rearGlassMesh = new THREE.Mesh(rearGlassGeo, glassMat)
    rearGlassMesh.position.set(0, 0.68, -0.92)
    rearGlassMesh.rotation.x = 0.44
    canopyGroup.add(rearGlassMesh)

    // Black Roof Pillars (A & C pillars)
    const aPillarLeftGeo = new THREE.BoxGeometry(0.06, 0.08, 0.95)
    const aPillarLeft = new THREE.Mesh(aPillarLeftGeo, glossBlackMat)
    aPillarLeft.position.set(0.66, 0.68, 0.82)
    aPillarLeft.rotation.x = -0.52
    canopyGroup.add(aPillarLeft)

    const aPillarRight = new THREE.Mesh(aPillarLeftGeo, glossBlackMat)
    aPillarRight.position.set(-0.66, 0.68, 0.82)
    aPillarRight.rotation.x = -0.52
    canopyGroup.add(aPillarRight)

    chassisGroup.add(canopyGroup)

    // --- C. Interior Cockpit (Visible through glass) ---
    const interiorGroup = new THREE.Group()

    // Dashboard Shelf
    const dashGeo = new THREE.BoxGeometry(1.24, 0.1, 0.45)
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.8 })
    const dashMesh = new THREE.Mesh(dashGeo, dashMat)
    dashMesh.position.set(0, 0.58, 0.48)
    interiorGroup.add(dashMesh)

    // Center 17" Touchscreen Display (Emissive glowing UI screen)
    const screenGeo = new THREE.BoxGeometry(0.24, 0.32, 0.03)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a })
    const screenMesh = new THREE.Mesh(screenGeo, screenMat)
    screenMesh.position.set(0, 0.56, 0.36)
    screenMesh.rotation.x = 0.18
    interiorGroup.add(screenMesh)

    // Steering Yoke (SpaceX style)
    const yokeGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI)
    const yokeMat = new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.8 })
    const yokeMesh = new THREE.Mesh(yokeGeo, yokeMat)
    yokeMesh.position.set(0.35, 0.58, 0.32)
    yokeMesh.rotation.x = -Math.PI / 2 + 0.3
    interiorGroup.add(yokeMesh)

    // Driver & Passenger Sport Bucket Seats
    const seatGeo = new THREE.BoxGeometry(0.42, 0.52, 0.42)
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.7 })

    const driverSeat = new THREE.Mesh(seatGeo, seatMat)
    driverSeat.position.set(0.35, 0.48, -0.15)
    interiorGroup.add(driverSeat)

    const passSeat = new THREE.Mesh(seatGeo, seatMat)
    passSeat.position.set(-0.35, 0.48, -0.15)
    interiorGroup.add(passSeat)

    chassisGroup.add(interiorGroup)

    // --- D. Signature Tesla Lighting ---
    // 1. Matrix Laser Headlights (Front left & right)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const leftHeadlightGeo = new THREE.BoxGeometry(0.36, 0.04, 0.12)
    const leftHeadlight = new THREE.Mesh(leftHeadlightGeo, headlightMat)
    leftHeadlight.position.set(0.64, 0.41, 2.12)
    leftHeadlight.rotation.y = -0.2
    chassisGroup.add(leftHeadlight)
    headlightMeshes.push(leftHeadlight)

    const rightHeadlight = new THREE.Mesh(leftHeadlightGeo, headlightMat)
    rightHeadlight.position.set(-0.64, 0.41, 2.12)
    rightHeadlight.rotation.y = 0.2
    chassisGroup.add(rightHeadlight)
    headlightMeshes.push(rightHeadlight)

    // Front Continuous Cyber Lightstrip
    const lightstripGeo = new THREE.BoxGeometry(0.72, 0.02, 0.04)
    const lightstripMesh = new THREE.Mesh(lightstripGeo, headlightMat)
    lightstripMesh.position.set(0, 0.41, 2.22)
    chassisGroup.add(lightstripMesh)
    headlightMeshes.push(lightstripMesh)

    // Functional Spotlights casting onto floor
    const leftSpot = new THREE.SpotLight(0xffffff, 4.5, 12, Math.PI / 4, 0.4)
    leftSpot.position.set(0.64, 0.42, 2.2)
    leftSpot.target.position.set(0.64, 0, 8)
    scene.add(leftSpot)
    scene.add(leftSpot.target)
    headlightLights.push(leftSpot)

    const rightSpot = new THREE.SpotLight(0xffffff, 4.5, 12, Math.PI / 4, 0.4)
    rightSpot.position.set(-0.64, 0.42, 2.2)
    rightSpot.target.position.set(-0.64, 0, 8)
    scene.add(rightSpot)
    scene.add(rightSpot.target)
    headlightLights.push(rightSpot)

    // 2. Rear Unbroken Continuous Red Blade Lightbar
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1515 })
    const taillightGeo = new THREE.BoxGeometry(1.62, 0.04, 0.08)
    const taillightMesh = new THREE.Mesh(taillightGeo, taillightMat)
    taillightMesh.position.set(0, 0.54, -2.05)
    chassisGroup.add(taillightMesh)
    taillightMeshes.push(taillightMesh)

    // Rear illumination point light
    const rearGlow = new THREE.PointLight(0xff1515, 2.5, 6)
    rearGlow.position.set(0, 0.54, -2.2)
    scene.add(rearGlow)
    taillightLights.push(rearGlow)

    // --- E. SpaceX Cold-Gas Thruster Package ---
    const spacexGroup = new THREE.Group()

    // Central Rocket Thruster Nozzle (Behind license plate area)
    const nozzleOuterGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.22, 32)
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x22242a,
      metalness: 0.95,
      roughness: 0.25,
    })
    const nozzleMesh = new THREE.Mesh(nozzleOuterGeo, nozzleMat)
    nozzleMesh.rotation.x = Math.PI / 2
    nozzleMesh.position.set(0, 0.38, -2.08)
    spacexGroup.add(nozzleMesh)

    // Inner Thruster Core (Glows intense cyan when firing)
    const coreGeo = new THREE.CircleGeometry(0.11, 24)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreMesh.position.set(0, 0.38, -2.18)
    coreMesh.rotation.y = Math.PI
    spacexGroup.add(coreMesh)

    // Two Auxiliary Vectoring Side Thrusters
    const sideNozzleGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.12, 16)
    const leftSideNozzle = new THREE.Mesh(sideNozzleGeo, nozzleMat)
    leftSideNozzle.rotation.x = Math.PI / 2
    leftSideNozzle.position.set(0.68, 0.34, -2.04)
    spacexGroup.add(leftSideNozzle)

    const rightSideNozzle = new THREE.Mesh(sideNozzleGeo, nozzleMat)
    rightSideNozzle.rotation.x = Math.PI / 2
    rightSideNozzle.position.set(-0.68, 0.34, -2.04)
    spacexGroup.add(rightSideNozzle)

    // Thruster Dynamic Point Light (Fires cyan glow)
    const thrusterLight = new THREE.PointLight(0x00e5ff, 0, 8)
    thrusterLight.position.set(0, 0.38, -2.3)
    scene.add(thrusterLight)

    // Supersonic Particle System (Cold-gas plume)
    const particleCount = 220
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVelocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      particlePositions[idx] = (Math.random() - 0.5) * 0.25
      particlePositions[idx + 1] = 0.38 + (Math.random() - 0.5) * 0.2
      particlePositions[idx + 2] = -2.15 - Math.random() * 1.8

      particleVelocities[idx] = (Math.random() - 0.5) * 0.05
      particleVelocities[idx + 1] = (Math.random() - 0.5) * 0.05
      particleVelocities[idx + 2] = -0.15 - Math.random() * 0.2
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.09,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const thrusterParticles = new THREE.Points(particleGeo, particleMat)
    spacexGroup.add(thrusterParticles)

    chassisGroup.add(spacexGroup)

    // --- F. High-Performance Turbine Wheels & Calipers ---
    const wheelPositions: [number, number, number][] = [
      [0.96, 0.34, 1.25], // Front Left
      [-0.96, 0.34, 1.25], // Front Right
      [0.98, 0.35, -1.25], // Rear Left
      [-0.98, 0.35, -1.25], // Rear Right
    ]

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.position.set(x, y, z)

      // Outer Performance Rubber Tire
      const tireGeo = new THREE.TorusGeometry(0.33, 0.09, 18, 36)
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x161719,
        roughness: 0.85,
        metalness: 0.05,
      })
      const tireMesh = new THREE.Mesh(tireGeo, tireMat)
      tireMesh.rotation.y = Math.PI / 2
      tireMesh.castShadow = true
      wheelGroup.add(tireMesh)

      // Satin Gunmetal Alloy Rim Disc
      const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.16, 24)
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x23252a,
        roughness: 0.25,
        metalness: 0.88,
      })
      const rimMesh = new THREE.Mesh(rimGeo, rimMat)
      rimMesh.rotation.z = Math.PI / 2
      wheelGroup.add(rimMesh)

      // Aerodynamic Turbine Spokes (5 blades)
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, 0.22, 0.03)
        const spokeMat = new THREE.MeshStandardMaterial({
          color: 0x3d414a,
          metalness: 0.9,
          roughness: 0.2,
        })
        const spoke = new THREE.Mesh(spokeGeo, spokeMat)
        spoke.rotation.x = (s * Math.PI * 2) / 5
        spoke.position.x = x > 0 ? 0.07 : -0.07
        wheelGroup.add(spoke)
      }

      // Drilled Carbon-Ceramic Brake Rotor
      const rotorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24)
      const rotorMat = new THREE.MeshStandardMaterial({
        color: 0x4a4d55,
        roughness: 0.3,
        metalness: 0.95,
      })
      const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat)
      rotorMesh.rotation.z = Math.PI / 2
      wheelGroup.add(rotorMesh)

      // Signature Racing Red Tesla Caliper
      const caliperGeo = new THREE.BoxGeometry(0.05, 0.12, 0.08)
      const caliperMat = new THREE.MeshStandardMaterial({
        color: 0xe82127,
        metalness: 0.5,
        roughness: 0.2,
      })
      const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat)
      caliperMesh.position.set(x > 0 ? 0.04 : -0.04, 0.1, 0)
      wheelGroup.add(caliperMesh)

      carRoot.add(wheelGroup)
      wheelMeshes.push(wheelGroup)
    })

    carRoot.add(chassisGroup)
    scene.add(carRoot)

    // Save references
    threeRefs.current = {
      scene,
      camera,
      renderer,
      controls,
      carGroup: carRoot,
      bodyMaterials,
      headlightMeshes,
      taillightMeshes,
      headlightLights,
      taillightLights,
      thrusterLight,
      thrusterParticles,
      particleVelocities,
      wheelMeshes,
      turntableRing: ringMesh,
      targetSuspensionY: 0,
      currentSuspensionY: 0,
      soundAudio: null,
    }

    // 8. Animation & Render Loop
    let lastTime = performance.now()
    let frameCount = 0
    let lastFpsUpdate = performance.now()

    const animate = (time: number) => {
      threeRefs.current.animationFrameId = requestAnimationFrame(animate)

      const delta = (time - lastTime) / 1000
      lastTime = time

      // FPS counter
      frameCount++
      if (time - lastFpsUpdate > 500) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsUpdate)))
        frameCount = 0
        lastFpsUpdate = time
      }

      // Smooth suspension lerp
      const refs = threeRefs.current
      if (refs.carGroup) {
        refs.currentSuspensionY += (refs.targetSuspensionY - refs.currentSuspensionY) * 0.08

        // Hover oscillation when in hover or thrusters active
        if (refs.targetSuspensionY > 0.1) {
          const hoverFloat = Math.sin(time * 0.005) * 0.015
          refs.carGroup.position.y = refs.currentSuspensionY + hoverFloat
          refs.carGroup.rotation.z = Math.sin(time * 0.003) * 0.008
        } else {
          refs.carGroup.position.y = refs.currentSuspensionY
          refs.carGroup.rotation.z = 0
        }
      }

      // Thruster Particle Jet Simulation
      if (refs.thrusterParticles && refs.thrusterLight) {
        const pMat = refs.thrusterParticles.material as THREE.PointsMaterial
        if (thrustersActive) {
          pMat.opacity = 0.85 + Math.sin(time * 0.02) * 0.15
          refs.thrusterLight.intensity = 5.0 + Math.sin(time * 0.03) * 2.0

          const posAttr = refs.thrusterParticles.geometry.attributes.position as THREE.BufferAttribute
          const posArray = posAttr.array as Float32Array
          const vels = refs.particleVelocities!

          for (let i = 0; i < particleCount; i++) {
            const idx = i * 3
            posArray[idx + 2] += vels[idx + 2]
            posArray[idx] += vels[idx]
            posArray[idx + 1] += vels[idx + 1]

            // Reset particle when it shoots too far back
            if (posArray[idx + 2] < -4.8) {
              posArray[idx] = (Math.random() - 0.5) * 0.22
              posArray[idx + 1] = 0.38 + (Math.random() - 0.5) * 0.18
              posArray[idx + 2] = -2.15
            }
          }
          posAttr.needsUpdate = true
        } else {
          pMat.opacity = 0
          refs.thrusterLight.intensity = 0
        }
      }

      // Turntable and wheel rotation
      if (controls.autoRotate) {
        refs.wheelMeshes.forEach((wheel) => {
          wheel.rotation.x += 0.02
        })
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate(performance.now())

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 520
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (threeRefs.current.animationFrameId) {
        cancelAnimationFrame(threeRefs.current.animationFrameId)
      }
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [thrustersActive])

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white shadow-2xl ${className}`}
    >
      {/* ── Top HUD Header ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-500">
            <Rocket size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Roadster 3D Studio
              </span>
              <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                SpaceX Package
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Interactive 360° Studio • Real-Time Physically Based Clearcoat
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/60">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>WebGL 2.0 • {fps} FPS</span>
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs font-mono">
            {(
              [
                { id: 'hero', label: '3/4' },
                { id: 'side', label: 'Side' },
                { id: 'rear', label: 'Rear' },
                { id: 'top', label: 'Top' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => applyCameraPreset(p.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  activePreset === p.id
                    ? 'bg-primary text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360° Auto-Rotate"
            className={`grid size-8 place-items-center rounded-lg border text-xs transition-all ${
              autoRotate
                ? 'border-primary/50 bg-primary/20 text-primary'
                : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <RotateCcw size={14} className={autoRotate ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Main 3D Canvas Viewport ─────────────────────────────────── */}
      <div className="relative h-[380px] sm:h-[480px] md:h-[540px] w-full">
        {/* Three.js DOM container */}
        <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

        {/* Touch & Interaction Hint */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[10px] text-white/60 backdrop-blur-md">
          <Eye size={12} className="text-white/40" />
          <span>Drag to orbit • Scroll to zoom • Right-click to pan</span>
        </div>

        {/* Floating SpaceX Thruster Status Overlay */}
        {thrustersActive && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2.5 rounded-xl border border-cyan-500/50 bg-black/85 px-4 py-2 font-mono shadow-lg shadow-cyan-950/50 backdrop-blur-md animate-pulse">
            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-[11px] font-bold text-cyan-400">COLD-GAS RCS FIRING</p>
              <p className="text-[9px] text-cyan-200/70">10,000 PSI • ZERO-G LEVITATION HOVER</p>
            </div>
          </div>
        )}

        {/* Floating Quick Action Overlays on the Right */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Laser Headlights Toggle */}
          <button
            onClick={() => setLightsActive(!lightsActive)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[10px] font-bold backdrop-blur-md transition-all ${
              lightsActive
                ? 'border-yellow-500/50 bg-black/75 text-yellow-400 shadow-md shadow-yellow-950/30'
                : 'border-white/15 bg-black/60 text-white/50 hover:text-white'
            }`}
          >
            <Sun size={12} />
            <span>Lights {lightsActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Wireframe Exoskeleton Mode */}
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[10px] font-bold backdrop-blur-md transition-all ${
              wireframeMode
                ? 'border-emerald-500/50 bg-black/75 text-emerald-400 shadow-md shadow-emerald-950/30'
                : 'border-white/15 bg-black/60 text-white/50 hover:text-white'
            }`}
          >
            <Layers size={12} />
            <span>{wireframeMode ? 'Wireframe X-Ray' : 'Solid Shell'}</span>
          </button>

          {/* Suspension Ride Height */}
          <button
            onClick={() => {
              const next = suspensionMode === 'standard' ? 'track' : suspensionMode === 'track' ? 'hover' : 'standard'
              setSuspensionMode(next)
            }}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-[10px] font-bold text-white/70 hover:text-white backdrop-blur-md transition-all"
          >
            <Gauge size={12} className="text-primary" />
            <span className="capitalize">{suspensionMode} Stance</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Color Swatch Bar & Spec Panel ──────────────── */}
      <div className="relative z-10 border-t border-white/10 bg-zinc-950/95 p-5 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column: Paint Swatches & Descriptions */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  Paint Customizer
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedColor.name}</span>
                  <span className="text-xs font-normal text-white/40">({selectedColor.finish})</span>
                </h3>
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/70">
                {selectedColor.hex}
              </span>
            </div>

            <p className="mt-2 text-xs text-white/60 leading-relaxed max-w-xl">
              {selectedColor.description}
            </p>

            {/* Color Swatches Grid */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {TESLA_COLORS.map((color) => {
                const isSelected = selectedColor.id === color.id
                return (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    title={`${color.name} • ${color.finish}`}
                    className={`group relative flex items-center gap-2.5 rounded-xl border p-1.5 pr-3 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-red-950/40 ring-2 ring-primary/40'
                        : 'border-white/10 bg-zinc-900/80 hover:border-white/25 hover:bg-zinc-800/80'
                    }`}
                  >
                    {/* Swatch Pill with Metallic Rim */}
                    <span
                      className="size-7 rounded-lg border border-white/25 shadow-inner transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <span className="flex h-full w-full items-center justify-center text-white drop-shadow">
                          <Check size={14} className="stroke-[3]" />
                        </span>
                      )}
                    </span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-tight">{color.name}</p>
                      <p className="font-mono text-[9px] text-white/40 leading-tight">
                        {color.category.split(' ')[0]}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Interactive SpaceX Thruster Booster & Reserve CTA */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                  <Rocket size={12} />
                  <span>SpaceX Cold-Gas Propulsion</span>
                </span>
                <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 font-mono text-[9px] text-cyan-300">
                  10 RCS Thrusters
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Experience simulated supersonic cold-gas thruster ignition. Levitation counter-thrust lifts the vehicle body 120mm into zero-drag launch trajectory.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={toggleThrusters}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-mono text-xs font-bold transition-all active:scale-95 ${
                  thrustersActive
                    ? 'border border-cyan-400 bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
                    : 'border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400'
                }`}
              >
                <Flame size={15} className={thrustersActive ? 'animate-bounce' : ''} />
                <span>{thrustersActive ? 'CUT THRUSTER BURN' : 'FIRE SPACEX THRUSTERS'}</span>
              </button>

              <Link
                href="/inventory/d0100000-0000-4000-8000-000000000001"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-mono text-xs font-bold text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-red-950/50"
              >
                <span>Order with 15% VIP</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
