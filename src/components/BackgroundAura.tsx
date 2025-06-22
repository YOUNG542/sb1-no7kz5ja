export const BackgroundAura = () => {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="w-[400px] h-[400px] bg-pink-300 absolute top-[-100px] left-[-100px] rounded-full blur-3xl opacity-30 animate-auraOne" />
        <div className="w-[500px] h-[500px] bg-red-200 absolute bottom-[-150px] right-[-150px] rounded-full blur-3xl opacity-20 animate-auraTwo" />
      </div>
    );
  };