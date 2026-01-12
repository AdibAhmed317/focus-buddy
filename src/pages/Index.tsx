import RandomFocusSound from "@/components/RandomFocusSound";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Container simulating Chrome extension popup */}
      <div className="rounded-2xl shadow-medium overflow-hidden border border-border">
        <RandomFocusSound />
      </div>
    </div>
  );
};

export default Index;
