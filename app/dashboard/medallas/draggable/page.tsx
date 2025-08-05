import { BadgeShowcase } from "@/components/badges/badge-showcase"

export default function DraggableBadgesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Badges Interactivas</h1>
      <p className="text-muted-foreground mb-8">
        Explora nuestra colección de badges interactivas. Puedes arrastrarlas y jugar con ellas. Las partículas de lava
        dentro de cada badge se mueven de forma dinámica.
      </p>

      <div className="bg-card rounded-lg shadow-md p-8">
        <BadgeShowcase />
      </div>
    </div>
  )
}
