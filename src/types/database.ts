export type UserRole = "admin" | "customer";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birth_date: string | null;
  color: string | null;
  weight: number | null;
  photo_url: string | null;
  public_token: string;
  nfc_enabled: boolean;
  is_public_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type VeterinaryRecord = {
  id: string;
  pet_id: string;
  record_type: string;
  title: string;
  description: string | null;
  date: string;
  veterinarian_name: string | null;
  clinic_name: string | null;
  next_due_date: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfileSettings = {
  id: string;
  pet_id: string;
  show_pet_photo: boolean;
  show_owner_name: boolean;
  show_owner_phone: boolean;
  show_emergency_contact: boolean;
  show_vaccination_status: boolean;
  show_allergies: boolean;
  show_medical_notes: boolean;
  created_at: string;
  updated_at: string;
};
