import { Seo } from "@/components/Seo";

export default function AffiliateBildirimi() {
  return (
    <>
      <Seo
        title="Affiliate Bildirimi – Dijitalstok"
        description="Dijitalstok.com'un affiliate link kullanımı ve komisyon yapısı hakkında bilgi edinin."
      />

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-4">Affiliate Bildirimi</h1>
            
            <p className="text-sm text-muted-foreground mb-8">
              Son güncelleme: 17 Aralık 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Affiliate Linkler Nedir?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com, bazı ürün ve hizmetler için affiliate linkler kullanmaktadır. 
                Bu linkler, sizin için ekstra bir maliyet oluşturmadan, sitemizin işletme maliyetlerini karşılamamıza yardımcı olur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Komisyon Yapısı</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sitemizde yer alan affiliate linkler üzerinden yapılan satın alımlarda, 
                biz küçük bir komisyon alırız. Bu komisyon, sizin ödemenizden hiçbir şekilde kesilmez 
                ve ürün fiyatını etkilemez.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Şeffaflık</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com olarak, kullanıcılarımıza karşı şeffaf olmayı önemsiyoruz. 
                Bu nedenle, affiliate link kullanımımızı açıkça belirtiyoruz. 
                Sitemizdeki tüm ürün linkleri, affiliate programları aracılığıyla sağlanmaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Affiliate bildirimi hakkında sorularınız için lütfen{" "}
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
