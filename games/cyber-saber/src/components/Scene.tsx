import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store'
import HandController from './HandController'

export default function Scene() {
  const { isStarted, handPos, addScore } = useGameStore()
  const [boxes, setBoxes] = useState<{ id: number; x: number; z: number; color: string; cut: boolean }[]>([
    { id: 1, x: 0, z: -10, color: '#00ffff', cut: false },
    { id: 2, x: -1.5, z: -20, color: '#ff00ff', cut: false },
    { id: 3, x: 1.5, z: -30, color: '#00ffff', cut: false },
  ])

  useFrame((_, delta) => {
    if (!isStarted) return

    setBoxes((prev) =>
      prev.map((box) => ({
        ...box,
        z: box.z + delta * 9,
      })).filter((box) => box.z < 3)
    )

    if (Math.random() - 0.025 < 0 && boxes.length < 6 || Math.random() < 0.025) {
      if (boxes.length < 6) {
        const randX = (Math.random() - 0.5) * 4
        setBoxes((prev) => [
          ...prev,
          { id: Date.now(), x: randX, z: -35, color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff', cut: false }
        ])
      }
    }

    setBoxes((prev) =>
      prev.map((box) => {
        if (!box.cut && box.z > -1 && box.z < 1) {
          const dist = Math.hypot(handPos[0] - box.x, handPos[1] - 0.5)
          if (dist < 1.2) {
            addScore(100)
            return { ...box, cut: true }
          }
        }
        return box
      }).filter((box) => !box.cut && box.z < 3)
    )
  })

  return (
    <>
      <color attach="background" args={['#020208']} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2} />

      <gridHelper args={[50, 50, '#ff00ff', '#00ffff']} position={[0, -1, 0]} />

      {boxes.map((box) => (
        <mesh key={box.id} position={[box.x, 0.5, box.z]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={box.color} emissive={box.color} emissiveIntensity={2.5} wireframe />
        </mesh>
      ))}

      <group position={[handPos[0], handPos[1], 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} />
        </mesh>
      </group>

      <HandController />
    </>
  )
}