'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ImpressumData {
  companyName: string;
  owner: string;
  address: string;
  phone: string;
  email: string;
  ustId: string;
  steuernummer: string;
  registerCourt: string;
  registerNumber: string;
  responsibleForContent: string;
  responsibleAddress: string;
  additionalInfo: string;
}

const fallbackImpressum: ImpressumData = {
  companyName: 'Pizza Roma Siegen',
  owner: '[Inhaber Name]',
  address: '[Straße und Hausnummer], 57072 Siegen',
  phone: '+49 271 [Telefonnummer]',
  email: 'info@pizza-roma-siegen.de',
  ustId: 'DE [USt-IdNr.]',
  steuernummer: '[Steuernummer]',
  registerCourt: '',
  registerNumber: '',
  responsibleForContent: '[Inhaber Name]',
  responsibleAddress: '[Straße und Hausnummer], 57072 Siegen',
  additionalInfo: ''
};

export default function ImpressumPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<ImpressumData>(fallbackImpressum);

  useEffect(() => {
    fetch('/api/menu', { cache: 'no-store' })
      .then(res => res.json())
      .then(menuData => {
        if (menuData.legal?.impressum) {
          setData({ ...fallbackImpressum, ...menuData.legal.impressum });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-roma-dark py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-poppins font-bold text-white mb-8">Impressum</h1>
        
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6 text-white/80">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Angaben gemäß § 5 TMG</h2>
            <p className="font-semibold text-lg text-roma-gold">{data.companyName}</p>
            <p>{data.owner}</p>
            <p>{data.address}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Kontakt</h2>
            <p>Telefon: {data.phone}</p>
            <p>E-Mail: <a href={`mailto:${data.email}`} className="text-roma-gold hover:underline">{data.email}</a></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Umsatzsteuer-ID</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {data.ustId}</p>
            {data.steuernummer && <p>Steuernummer: {data.steuernummer}</p>}
          </div>

          {data.registerCourt && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Handelsregister</h2>
              <p>{data.registerCourt} — {data.registerNumber}</p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>{data.responsibleForContent}</p>
            <p>{data.responsibleAddress}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-roma-gold hover:underline">https://ec.europa.eu/consumers/odr/</a></p>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Haftung für Inhalte</h2>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Haftung für Links</h2>
            <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Urheberrecht</h2>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </div>

          {data.additionalInfo && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Zusätzliche Informationen</h2>
              <p className="whitespace-pre-line">{data.additionalInfo}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-roma-gold hover:underline">← Zurück zur Startseite</a>
        </div>
      </div>
    </div>
  );
}
