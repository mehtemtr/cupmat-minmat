export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div>
        <h2 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-400">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      </div>
    </div>
  );
}
