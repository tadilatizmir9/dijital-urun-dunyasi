import { Seo } from "@/components/Seo";

export default function Hakkinda() {
  return (
    <>
      <Seo
        title="Hakkında – Dijitalstok"
        description="Dijitalstok.com hakkında bilgi edinin. Dijital ürün kataloğumuz ve misyonumuz."
      />

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-4">Hakkında</h1>
            
            <p className="text-sm text-muted-foreground mb-8">
              Son güncelleme: 17 Aralık 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Dijitalstok Nedir?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com, dijital yaratıcılar için seçilmiş mockup, şablon ve stok içeriklerin 
                keşfedilebileceği bir katalog platformudur. Envato ve benzeri platformlardan 
                seçilmiş premium dijital ürünleri tek bir yerde topluyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Misyonumuz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijital içerik üreticilerinin ihtiyaç duydukları kaynakları hızlı ve kolay bir şekilde 
                bulabilmelerini sağlamak. Kaliteli dijital ürünleri kategorize ederek, 
                kullanıcıların aradıklarını saniyeler içinde keşfetmelerine yardımcı oluyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Ne Sunuyoruz?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dijitalstok.com'da bulabileceğiniz içerik türleri:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Mockup'lar ve tasarım şablonları</li>
                <li>Canva şablonları ve grafik tasarım kaynakları</li>
                <li>Icon setleri ve vektör grafikler</li>
                <li>Stok fotoğraflar ve görseller</li>
                <li>Video şablonları ve motion graphics</li>
                <li>Fontlar ve tipografi kaynakları</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Nasıl Çalışıyoruz?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com, affiliate programlar aracılığıyla çalışır. 
                Sitemizde yer alan ürünlere tıkladığınızda, orijinal satıcının sayfasına yönlendirilirsiniz. 
                Satın alma işlemi doğrudan satıcı ile yapılır ve biz sadece bir katalog görevi görürüz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sorularınız, önerileriniz veya geri bildirimleriniz için lütfen{" "}
                <a href="/iletisim" className="text-primary hover:underline">
                  iletişim sayfamızdan
                </a>{" "}
                bizimle iletişime geçin.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
