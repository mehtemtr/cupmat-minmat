export default function MinMatPage() {
  return (
    <div className="min-h-screen bg-[#060b14]">
      <div className="w-full h-screen">
        <iframe 
          src="/minmat/index.html" 
          className="w-full h-full border-0 block"
          title="MinMat Oyunu"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
