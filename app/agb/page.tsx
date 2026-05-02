'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface AgbData {
  companyName: string;
  intro: string;
  scope: string;
  contractFormation: string;
  prices: string;
  delivery: string;
  payment: string;
  retentionOfTitle: string;
  warranty: string;
  liability: string;
  rightOfWithdrawal: string;
  dataProtection: string;
  finalProvisions: string;
  additionalInfo: string;
}

const fallbackAgb: AgbData = {
  companyName: 'Pizza Roma Siegen',
  intro: 'Die folgenden Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über unseren Online-Shop.',
  scope: 'Diese AGB gelten für alle Verträge zwischen Pizza Roma Siegen und dem Kunden über die Lieferung von Speisen und Getränken.',
  contractFormation: 'Die Darstellung der Produkte im Online-Shop stellt kein rechtsverbindliches Angebot dar. Durch Absenden der Bestellung gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt zustande, wenn wir die Bestellung durch Zusendung einer Auftragsbestätigung oder durch Lieferung der Ware annehmen.',
  prices: 'Alle angegebenen Preise sind Bruttopreise inklusive der gesetzlichen Umsatzsteuer (19%). Die Lieferkosten werden separat ausgewiesen und betragen 3,50 € (kostenlos ab 25 € Bestellwert).',
  delivery: 'Die Lieferung erfolgt ausschließlich innerhalb des Liefergebietes von Siegen und Umgebung. Die angegebenen Lieferzeiten sind Schätzungen. Wir bemühen uns um pünktliche Lieferung, können jedoch Verzögerungen aufgrund von Verkehr oder Wetter nicht ausschließen.',
  payment: 'Die Bezahlung erfolgt bei Lieferung in Bar oder per Kartenzahlung. Online-Zahlungen sind per PayPal oder Kreditkarte möglich.',
  retentionOfTitle: 'Bis zur vollständigen Bezahlung bleibt die Ware unser Eigentum.',
  warranty: 'Bei Mängeln an der gelieferten Ware hat der Kunde Anspruch auf Nacherfüllung (Ersatzlieferung oder Nachbesserung).',
  liability: 'Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten.',
  rightOfWithdrawal: 'Da es sich bei Lebensmitteln um leicht verderbliche Waren handelt, besteht kein Widerrufsrecht gemäß § 312g Abs. 2 Nr. 1 BGB.',
  dataProtection: 'Informationen zum Datenschutz finden Sie in unserer Datenschutzerklärung unter /datenschutz.',
  finalProvisions: 'Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Siegen, soweit der Kunde Kaufmann ist.',
  additionalInfo: ''
};

export default function AgbPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<AgbData>(fallbackAgb);

  useEffect(() => {
    fetch('/api/menu', { cache: 'no-store' })
      .then(res => res.json())
      .then(menuData => {
        if (menuData.legal?.agb) {
          setData({ ...fallbackAgb, ...menuData.legal.agb });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-roma-dark py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-poppins font-bold text-white mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-8 text-white/80">
          <div>
            <p className="font-semibold text-roma-gold text-lg">{data.companyName}</p>
            <p className="mt-2">{data.intro}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 1 Geltungsbereich</h2>
            <p>{data.scope}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 2 Vertragsschluss</h2>
            <p>{data.contractFormation}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 3 Preise und Zahlung</h2>
            <p>{data.prices}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 4 Lieferung</h2>
            <p>{data.delivery}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 5 Zahlungsbedingungen</h2>
            <p>{data.payment}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 6 Eigentumsvorbehalt</h2>
            <p>{data.retentionOfTitle}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 7 Gewährleistung</h2>
            <p>{data.warranty}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 8 Haftung</h2>
            <p>{data.liability}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 9 Widerrufsrecht</h2>
            <p>{data.rightOfWithdrawal}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 10 Datenschutz</h2>
            <p>{data.dataProtection}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">§ 11 Schlussbestimmungen</h2>
            <p>{data.finalProvisions}</p>
          </div>

          {data.additionalInfo && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">§ 12 Zusätzliche Bestimmungen</h2>
              <p className="whitespace-pre-line">{data.additionalInfo}</p>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 text-sm text-white/50">
            <p>Stand: {new Date().toLocaleDateString('de-DE')}</p>
          </div>
        </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-roma-gold hover:underline">← Zurück zur Startseite</Link>
          </div>
          <div className="mt-4 text-center">
            <Link href="/impressum" className="text-sm text-white/50 hover:text-roma-gold mx-2">Impressum</Link>
            <span className="text-white/30">|</span>
            <Link href="/datenschutz" className="text-sm text-white/50 hover:text-roma-gold mx-2">Datenschutz</Link>
          </div>
      </div>
    </div>
  );
}
