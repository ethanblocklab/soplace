import GameContainer from './components/GameContainer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center">
          So Place - 2.5D Placement Game
        </h1>
        <p className="text-center mb-6">
          Drag and drop buildings onto the isometric grid to create your layout.
        </p>

        <div className="w-full h-[800px]">
          <GameContainer width={800} height={600} />
        </div>
      </div>
    </main>
  )
}
