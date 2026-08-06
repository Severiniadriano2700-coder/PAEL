import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import RegistrationForm from "@/components/RegistrationForm";

export default function InscripcionPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <Sidebar active="/inscripcion" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar userName="Invitado" userRole="Sin identificar" />
        <main style={{ padding: 20, flex: 1 }}>
          <RegistrationForm />
        </main>
      </div>
    </div>
  );
}
