import { Linking } from 'react-native';

const { version: APP_VERSION } = require('../../app.json').expo;

const OWNER = 'ClaytonPrebelli';
const REPO = 'appTrigono';
const GITHUB_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

export interface UpdateInfo {
  disponivel: boolean;
  versaoAtual: string;
  versaoNova: string;
  downloadUrl: string;
  nomeArquivo: string;
}

export async function verificarAtualizacao(): Promise<UpdateInfo | null> {
  try {
    const response = await fetch(GITHUB_API, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!response.ok) return null;

    const release = await response.json();
    const versaoNova = (release.tag_name as string).replace(/^v/, '');
    const apkAsset = release.assets?.find((a: any) =>
      a.name.endsWith('.apk')
    );

    if (!apkAsset) return null;
    if (!isVersaoNova(APP_VERSION, versaoNova)) return null;

    return {
      disponivel: true,
      versaoAtual: APP_VERSION,
      versaoNova,
      downloadUrl: apkAsset.browser_download_url,
      nomeArquivo: apkAsset.name,
    };
  } catch {
    return null;
  }
}

function isVersaoNova(atual: string, nova: string): boolean {
  const a = atual.split('.').map(Number);
  const n = nova.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, n.length); i++) {
    const ai = a[i] || 0;
    const ni = n[i] || 0;
    if (ni > ai) return true;
    if (ni < ai) return false;
  }
  return false;
}

export async function baixarEInstalar(downloadUrl: string): Promise<void> {
  await Linking.openURL(downloadUrl);
}
