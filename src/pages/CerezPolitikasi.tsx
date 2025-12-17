import { Seo } from "@/components/Seo";

export default function CerezPolitikasi() {
  return (
    <>
      <Seo
        title="Çerez Politikası – Dijitalstok"
        description="Dijitalstok.com'un çerez kullanımı hakkında bilgi edinin. Çerez türleri, yönetimi ve gizlilik haklarınız."
      />

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-4">Çerez Politikası</h1>
            
            <p className="text-sm text-muted-foreground mb-8">
              Son güncelleme: 17 Aralık 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Çerez nedir?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır. 
                Bu dosyalar, web sitesinin düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirmek için kullanılır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Hangi tür çerezleri kullanıyoruz?</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Zorunlu Çerezler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu çerezler web sitesinin temel işlevlerini yerine getirmesi için gereklidir. 
                    Site güvenliği, oturum yönetimi ve kullanıcı tercihlerinin saklanması gibi işlevler için kullanılır.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analitik Çerezler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Web sitesinin nasıl kullanıldığını anlamak için kullanılır. 
                    Ziyaretçi sayıları, sayfa görüntülemeleri ve kullanıcı davranışları hakkında bilgi toplar. 
                    Bu bilgiler anonimdir ve kişisel kimliğinizi ortaya çıkarmaz.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Pazarlama Çerezleri</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    İleride reklam ve pazarlama amaçlı kullanılabilir. 
                    Şu anda aktif olarak pazarlama çerezleri kullanılmamaktadır.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Üçüncü taraf hizmetler</h2>
              <p className="text-muted-foreground leading-relaxed">
                İleride Google Analytics, reklam platformları veya sosyal medya entegrasyonları gibi üçüncü taraf hizmetler kullanılabilir. 
                Bu durumda, ilgili hizmetlerin kendi çerez politikaları geçerli olacaktır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Çerezleri nasıl yönetirsiniz?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Çerezleri tamamen engelleyebilirsiniz (bazı site özellikleri çalışmayabilir)</li>
                <li>Belirli çerezleri silmek için tarayıcı ayarlarınızı kullanabilirsiniz</li>
                <li>Çerez tercihlerinizi site üzerinden değiştirebilirsiniz</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Çoğu tarayıcıda, çerez ayarlarına "Ayarlar" veya "Tercihler" menüsünden ulaşabilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Çerez politikamız hakkında sorularınız için lütfen{" "}
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
