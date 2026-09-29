import logoUrl from "../assets/zaberman-logo-dark.png";

export function Brand() {
  return (
    <div className="brand" aria-label="Zaberman">
      <img className="brand__image" src={logoUrl} alt="Zaberman — single-piece moving service" />
    </div>
  );
}
