export default function AnimatedBackground() {
  return (
    <>
      <div className="animated-bg" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="blob bg-forest-700 w-96 h-96 -top-20 -left-20 animate-float" />
        <div className="blob bg-gold w-80 h-80 top-1/3 -right-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="blob bg-forest-900 w-72 h-72 bottom-0 left-1/3 animate-float" style={{ animationDelay: "4s" }} />
      </div>
    </>
  );
}