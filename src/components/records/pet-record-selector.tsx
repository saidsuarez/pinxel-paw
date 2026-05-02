"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

type PetOption = {
  id: string;
  name: string;
};

export function PetRecordSelector({ pets, selectedPetId }: { pets: PetOption[]; selectedPetId: string }) {
  const router = useRouter();

  return (
    <div className="space-y-2 sm:hidden">
      <Label htmlFor="records-pet">Mascota</Label>
      <select
        id="records-pet"
        value={selectedPetId}
        className="h-12 w-full rounded-full border border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        onChange={(event) => router.push(`/records?pet=${event.target.value}`)}
      >
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.name}
          </option>
        ))}
      </select>
    </div>
  );
}
