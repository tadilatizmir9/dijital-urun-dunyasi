import { Seo } from "@/components/Seo";

export default function GizlilikPolitikasi() {
  return (
    <>
      <Seo
        title="Gizlilik Politikası – Dijitalstok"
        description="Dijitalstok.com'un gizlilik politikası ve kişisel verilerinizin korunması hakkında bilgi edinin."
      />

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-4">Gizlilik Politikası</h1>
            
            <p className="text-sm text-muted-foreground mb-8">
              Son güncelleme: 17 Aralık 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Veri Toplama</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com, ziyaretçilerimizin temel kullanım verilerini toplar. 
                Bu veriler, web sitesinin iyileştirilmesi ve kullanıcı deneyiminin geliştirilmesi için kullanılır. 
                Kişisel bilgileriniz, yalnızca iletişim formu aracılığıyla gönderdiğiniz durumlarda saklanır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Çerezler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sitemiz, temel işlevsellik ve analitik amaçlar için çerezler kullanır. 
                Çerez kullanımımız hakkında detaylı bilgi için{" "}
                <a href="/cerez-politikasi" className="text-primary hover:underline">
                  Çerez Politikası
                </a>{" "}
                sayfamızı ziyaret edebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Üçüncü Taraf Hizmetler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dijitalstok.com, hizmetlerini sağlamak için üçüncü taraf hizmet sağlayıcıları kullanabilir. 
                Bu hizmet sağlayıcılar, verilerinizi yalnızca hizmet sağlama amacıyla kullanır 
                ve kendi gizlilik politikalarına tabidir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Veri Güvenliği</h2>
              <p className="text-muted-foreground leading-relaxed">
                Verilerinizin güvenliğini sağlamak için uygun teknik ve idari önlemler alıyoruz. 
                Ancak, internet üzerinden veri aktarımının %100 güvenli olmadığını unutmayın.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için lütfen{" "}
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
