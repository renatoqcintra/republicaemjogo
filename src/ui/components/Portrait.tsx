import { useId } from 'react';
import type { PortraitSpec } from '@/game/types';

interface Props {
  spec: PortraitSpec;
  size?: 'sm' | 'md' | 'lg';
  label: string;
}

const SIZE_PX = { sm: 46, md: 84, lg: 128 } as const;

/** Camisa social clara usada sob terno/toga. */
const SHIRT = '#dcd5c6';

/**
 * Margens do "aro de cabelo": até onde o cabelo pode passar do contorno do
 * crânio. Lateral curta (volume colado à cabeça) e topo maior (volume do
 * penteado). O clip por personagem é o que impede qualquer estilo de furar a
 * silhueta da cabeça — o defeito do "cabelo para fora da cabeça".
 */
const HAIR_GAP_X = 1.5;
const HAIR_GAP_TOP = 5;

// --------------------------------------------------------------------------
// Geometria da cabeça (mesmos números usados no desenho do rosto)
// --------------------------------------------------------------------------
type FaceShape = PortraitSpec['faceShape'];

const ELLIPSE_HEAD = {
  round: { cx: 50, cy: 42, rx: 24.5, ry: 24 },
  long: { cx: 50, cy: 41, rx: 20.5, ry: 27 },
  oval: { cx: 50, cy: 41, rx: 23, ry: 26 },
} as const;

/** Volume lateral/topo do próprio cabelo (sempre menor que o aro do clip). */
const HAIR_FIT_X = 1;
const HAIR_FIT_TOP = 4;

const n = (v: number) => Math.round(v * 100) / 100;
type Pt = [number, number];

/**
 * Borda externa do cabelo: acompanha o contorno do crânio (mais o volume do
 * penteado) do canto esquerdo em `yb`, pela coroa, até o canto direito — é o
 * que impede o cabelo de escapar para fora da cabeça em qualquer formato.
 */
function outerHairPoints(shape: FaceShape, yb: number): Pt[] {
  const pts: Pt[] = [];
  if (shape === 'square') {
    // Cabeça quadrada: laterais retas (x 30/70) e topo em curva até (50,17).
    const lx = 30 - HAIR_FIT_X;
    const rx = 70 + HAIR_FIT_X;
    const top = 17 - HAIR_FIT_TOP;
    const q = (from: Pt, ctrl: Pt, to: Pt, steps: number) => {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        pts.push([
          u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
          u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
        ]);
      }
    };
    const sideSteps = 4;
    // lateral esquerda (de yb até o início do arco)
    for (let i = 0; i <= sideSteps; i++) pts.push([lx, yb + (31 - yb) * (i / sideSteps)]);
    // arco superior esquerdo → coroa → arco superior direito
    q([lx, 31], [lx, top], [50, top], 10);
    q([50, top], [rx, top], [rx, 31], 10);
    // lateral direita (do arco até yb)
    for (let i = 1; i <= sideSteps; i++) pts.push([rx, 31 + (yb - 31) * (i / sideSteps)]);
    return pts;
  }
  const h = ELLIPSE_HEAD[shape];
  const rx = h.rx + HAIR_FIT_X;
  const ry = h.ry + HAIR_FIT_TOP;
  const s = Math.max(-0.99, Math.min(0.99, (yb - h.cy) / ry));
  const t0 = Math.asin(s);
  const steps = 40;
  const from = Math.PI - t0;
  const to = 2 * Math.PI + t0;
  for (let i = 0; i <= steps; i++) {
    const th = from + ((to - from) * i) / steps;
    pts.push([h.cx + rx * Math.cos(th), h.cy + ry * Math.sin(th)]);
  }
  return pts;
}

/** Converte polilinha em curva suave (quadráticas pelos pontos médios). */
function smoothPolyline(pts: Pt[]): string {
  const f = (v: number) => String(n(v));
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    d += `Q${f(x1)} ${f(y1)} ${f((x1 + x2) / 2)} ${f((y1 + y2) / 2)}`;
  }
  const last = pts[pts.length - 1];
  d += `L${f(last[0])} ${f(last[1])}`;
  return d;
}

/**
 * Caminho de uma faixa de cabelo "colada" na cabeça: borda externa segue o
 * contorno do crânio e a linha do cabelo é uma cúpula até a altura `hf`.
 * `yb` é onde a lateral do cabelo termina (ponta junto à orelha).
 */
function hairBandPath(shape: FaceShape, yb: number, hf: number) {
  const pts = outerHairPoints(shape, yb);
  const lx = pts[0][0];
  const rx = pts[pts.length - 1][0];
  const ih = (4 * hf - yb) / 3; // controle da cúpula: ápice da linha em `hf`
  const d = `${smoothPolyline(pts)}C${n(rx)} ${n(ih)} ${n(lx)} ${n(ih)} ${n(lx)} ${n(yb)}Z`;
  return { d, lx, rx };
}

/**
 * Retrato gerado por SVG determinístico a partir dos parâmetros do personagem.
 * É arte original e temporária: basta substituir este componente por imagens
 * finais sem alterar os dados dos personagens.
 *
 * Camadas (de trás para frente): fundo → pescoço → vestuário → cabelo traseiro
 * → rosto (formato variável) + orelhas → rugas → cabelo frontal (recortado por
 * um clip que acompanha o contorno do crânio, para o cabelo nunca escapar para
 * fora da cabeça) → traços do rosto → barba → óculos → acessórios → moldura
 * dourada. Formato de rosto, idade aparente, vestuário e penteado variam por
 * personagem para que nenhum pareça cópia do outro.
 */
export function Portrait({ spec, size = 'md', label }: Props) {
  const px = SIZE_PX[size];
  const senior = spec.age === 'senior';
  const middle = spec.age === 'middle';

  // --------------------------------------------------------------------------
  // Clip do cabelo: silhueta da cabeça "dilatada" pelas margens acima.
  // Todo penteado frontal é recortado por ele, então o cabelo abraça o
  // crânio em qualquer formato de rosto (nunca escapa para fora da cabeça).
  // --------------------------------------------------------------------------
  const clipId = `hairclip${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const hairClipShape = (() => {
    const x = HAIR_GAP_X;
    const top = HAIR_GAP_TOP;
    switch (spec.faceShape) {
      case 'round':
        return <ellipse cx="50" cy="42" rx={24.5 + x} ry={24 + top} />;
      case 'long':
        return <ellipse cx="50" cy="41" rx={20.5 + x} ry={27 + top} />;
      case 'square':
        return (
          <path
            d={`M${30 - x} 31 Q${30 - x} ${17 - top} 50 ${17 - top} Q${70 + x} ${17 - top} ${70 + x} 31 L${70 + x} 49 Q${70 + x} 63 50 66 Q${30 - x} 63 ${30 - x} 49 Z`}
          />
        );
      default:
        return <ellipse cx="50" cy="41" rx={23 + x} ry={26 + top} />;
    }
  })();

  // --------------------------------------------------------------------------
  // Cabelo traseiro (estilos com massa atrás da cabeça: 'long' e 'bun')
  // --------------------------------------------------------------------------
  const backHair = (() => {
    switch (spec.hairStyle) {
      case 'long':
        return (
          <path
            d="M17 50 C17 20 83 20 83 50 L83 90 L70 90 L70 50 L30 50 L30 90 L17 90 Z"
            fill={spec.hair}
          />
        );
      case 'bun':
        return (
          <g fill={spec.hair}>
            <circle cx="50" cy="16" r="8.5" />
            <path d="M23 46 C23 24 77 24 77 46 L77 52 L23 52 Z" />
          </g>
        );
      default:
        return null;
    }
  })();

  // --------------------------------------------------------------------------
  // Vestuário (ombros + gola, por tipo)
  // --------------------------------------------------------------------------
  const outfit = (() => {
    if (spec.outfit === 'robe') {
      // Toga judicial: manto largo escuro com faixa clara e pregas discretas.
      return (
        <g>
          <path d="M4 100 C8 74 30 64 50 64 C70 64 92 74 96 100 Z" fill="#151211" />
          <path d="M50 65 L41 71 L45 100 L55 100 L59 71 Z" fill={SHIRT} />
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5">
            <line x1="30" y1="76" x2="26" y2="100" />
            <line x1="50" y1="72" x2="50" y2="100" />
            <line x1="70" y1="76" x2="74" y2="100" />
          </g>
        </g>
      );
    }
    const base = <path d="M8 100 C11 77 30 66 50 66 C70 66 89 77 92 100 Z" fill={spec.coat} />;
    if (spec.outfit === 'shirt') {
      // Camisa social sem paletó, gola aberta.
      return (
        <g>
          {base}
          <path d="M50 66 L41 70 L46 80 L50 70 Z" fill={SHIRT} opacity="0.9" />
          <path d="M50 66 L59 70 L54 80 L50 70 Z" fill={SHIRT} opacity="0.9" />
          <path
            d="M50 66 L41 70 M50 66 L59 70"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
      );
    }
    if (spec.outfit === 'turtleneck') {
      // Blusa de gola alta: banda cobre a base do pescoço.
      return (
        <g>
          {base}
          <rect x="37" y="62" width="26" height="13" rx="6" fill={spec.coat} />
          <rect
            x="37"
            y="62"
            width="26"
            height="13"
            rx="6"
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="1"
          />
        </g>
      );
    }
    if (spec.outfit === 'jacket') {
      // Jaqueta casual com gola arredondada e zíper discreto.
      return (
        <g>
          {base}
          <path
            d="M37 68 Q50 76 63 68 L65 73 Q50 82 35 73 Z"
            fill="rgba(0,0,0,0.28)"
          />
          <line x1="50" y1="74" x2="50" y2="100" stroke="rgba(0,0,0,0.3)" strokeWidth="1.6" />
        </g>
      );
    }
    // 'suit': paletó com camisa e lapelas.
    return (
      <g>
        {base}
        <path d="M50 67 L39 73 L43 100 L57 100 L61 73 Z" fill={SHIRT} />
        <path
          d="M50 68 L40 72 L36 100 M50 68 L60 72 L64 100"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="2"
          fill="none"
        />
      </g>
    );
  })();

  // --------------------------------------------------------------------------
  // Cabeça por formato
  // --------------------------------------------------------------------------
  const head = (() => {
    switch (spec.faceShape) {
      case 'round':
        return <ellipse cx="50" cy="42" rx="24.5" ry="24" fill={spec.skin} />;
      case 'long':
        return <ellipse cx="50" cy="41" rx="20.5" ry="27" fill={spec.skin} />;
      case 'square':
        return (
          <path
            d="M30 31 Q30 17 50 17 Q70 17 70 31 L70 49 Q70 63 50 66 Q30 63 30 49 Z"
            fill={spec.skin}
          />
        );
      default:
        return <ellipse cx="50" cy="41" rx="23" ry="26" fill={spec.skin} />;
    }
  })();

  const earX = spec.faceShape === 'long' ? 29 : spec.faceShape === 'round' ? 26.5 : 27.5;
  const ears = (
    <g fill={spec.skin}>
      <ellipse cx={earX} cy="45" rx="3" ry="5" />
      <ellipse cx={100 - earX} cy="45" rx="3" ry="5" />
    </g>
  );

  // --------------------------------------------------------------------------
  // Rugas sutis por idade aparente
  // --------------------------------------------------------------------------
  const ageLines = (
    <g stroke="rgba(0,0,0,0.2)" strokeWidth="1.1" strokeLinecap="round" fill="none">
      {senior && <path d="M38 30 Q50 27 62 30" />}
      {senior && (
        <>
          <path d="M31 48 L28 50" />
          <path d="M69 48 L72 50" />
        </>
      )}
      {(senior || middle) && <path d="M43 52 Q42 56 44 58" opacity={senior ? 1 : 0.6} />}
      {(senior || middle) && <path d="M57 52 Q58 56 56 58" opacity={senior ? 1 : 0.6} />}
    </g>
  );

  // --------------------------------------------------------------------------
  // Cabelo frontal por estilo
  // --------------------------------------------------------------------------
  const hair = (() => {
    switch (spec.hairStyle) {
      case 'short':
        // Cabeça abraçada: a borda externa segue o contorno do crânio (mais o
        // volume do penteado) e a linha do cabelo é uma cúpula — nunca uma
        // faixa fina sobre a calva nem cabelo para fora da cabeça.
        return <path d={hairBandPath(spec.faceShape, 46, 26).d} fill={spec.hair} />;
      case 'wave':
        // Ondulado, penteado de lado: silhueta externa sempre acima do topo
        // do crânio (nunca uma calva em cima do cabelo).
        return (
          <path
            d="M21 47 C21 9 52 6 66 12 C78 17 81 31 77 42 C74 31 63 26 51 28 C40 30 27 35 25 48 Z"
            fill={spec.hair}
          />
        );
      case 'receding':
        // Entradas acentuadas na linha do cabelo (testa ampla), mas a coroa
        // sempre coberta — apenas André Monteiro ('bald') é careca de verdade.
        return (
          <path
            d="M24 48 C23 24 33 13 50 13 C67 13 77 24 76 48 C74 33 64 28 57 31 C53 29 47 29 43 31 C36 28 26 33 24 48 Z"
            fill={spec.hair}
          />
        );
      case 'curly':
        return (
          <g fill={spec.hair}>
            <circle cx="30" cy="34" r="11.5" />
            <circle cx="43" cy="27" r="12.5" />
            <circle cx="59" cy="27" r="12.5" />
            <circle cx="71" cy="35" r="11.5" />
          </g>
        );
      case 'long':
        // Coroa colada no crânio; o comprimento vem do cabelo traseiro (que
        // desce atrás das orelhas) — sem cortinas largas para fora da cabeça.
        return <path d={hairBandPath(spec.faceShape, 46, 28).d} fill={spec.hair} />;
      case 'bun':
        // Cabelo repuxado, sem franja; coroa coberta e colada ao crânio.
        return <path d={hairBandPath(spec.faceShape, 45, 28).d} fill={spec.hair} />;
      case 'bald':
        // Careca total: sem qualquer fio — só a cabeça (traço do personagem).
        return null;
      case 'back': {
        // Penteado para trás: testa exposta, coroa colada ao crânio e filete
        // de penteado desenhado dentro da própria massa de cabelo.
        const band = hairBandPath(spec.faceShape, 45, 23);
        const combY = 23 + 3; // um passo abaixo da linha do cabelo, dentro da massa
        const comb = `M${n(band.lx + 6)} ${combY} Q50 ${n(23 - 9)} ${n(band.rx - 6)} ${combY}`;
        return (
          <g>
            <path d={band.d} fill={spec.hair} />
            <path
              d={comb}
              fill="none"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        );
      }
      case 'swoop':
        // Penteado volumoso, empinado e penteado para trás e de lado.
        return (
          <g fill={spec.hair}>
            <path d="M22 46 C18 27 30 13 50 13 C70 13 83 25 81 42 C80 33 74 27 62 26 C50 25 38 28 30 34 C26 37 24 41 22 46 Z" />
            <path d="M31 34 C39 19 61 15 77 22 C63 20 43 24 34 36 Z" opacity="0.85" />
          </g>
        );
      case 'cap':
        // Boné (não usado por nenhum personagem; mantido só por compatibilidade).
        return (
          <g fill={spec.hair}>
            <path d="M20 44 C20 4 80 4 80 44 Z" />
            <rect x="14" y="42" width="72" height="7" rx="3" />
          </g>
        );
      default:
        return null;
    }
  })();

  return (
    <svg
      className={`portrait portrait-${size}`}
      width={px}
      height={px}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Retrato de ${label}`}
    >
      <defs>
        <linearGradient id={`bg-${spec.accent.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2622" />
          <stop offset="100%" stopColor="#0d1211" />
        </linearGradient>
        <clipPath id={clipId}>{hairClipShape}</clipPath>
      </defs>
      <rect width="100" height="100" fill={`url(#bg-${spec.accent.slice(1)})`} />
      {/* pescoço (fica atrás do vestuário) */}
      <rect x="42" y="55" width="16" height="16" rx="6" fill={spec.skin} />
      {/* vestuário */}
      {outfit}
      {/* cabelo traseiro */}
      {backHair}
      {/* cabeça e orelhas */}
      {head}
      {ears}
      {ageLines}
      {/* olhos */}
      <g fill="#12100e">
        <ellipse cx="41" cy="42" rx="2.6" ry="3" />
        <ellipse cx="59" cy="42" rx="2.6" ry="3" />
      </g>
      {/* sobrancelhas */}
      <g stroke={spec.hair} strokeWidth={spec.brows === 'thick' ? 3 : spec.brows === 'thin' ? 1.4 : 2} strokeLinecap="round">
        <line x1="36" y1="36" x2="46" y2="37" />
        <line x1="54" y1="37" x2="64" y2="36" />
      </g>
      {/* cabelo frontal (recortado pelo aro para nunca furar a cabeça) */}
      <g clipPath={`url(#${clipId})`}>{hair}</g>
      {/* nariz e boca */}
      <path
        d="M50 44 L48 52 L52 52"
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {spec.lips === 'soft' ? (
        <path d="M44 56 Q50 53 56 56 Q50 62 44 56 Z" fill="rgba(146,74,74,0.6)" />
      ) : spec.lips === 'smile' ? (
        <path
          d="M41.5 54.5 C45.5 61 54.5 61 58.5 54.5 C54.5 57.6 45.5 57.6 41.5 54.5 Z"
          fill="rgba(0,0,0,0.42)"
        />
      ) : (
        <path
          d="M43 57 Q50 61 57 57"
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {/* barba */}
      {spec.beard === 'short' && (
        <path d="M32 50 C34 70 66 70 68 50 C66 62 34 62 32 50 Z" fill={spec.hair} opacity="0.55" />
      )}
      {spec.beard === 'full' && (
        <path
          d="M30 46 C30 78 70 78 70 46 C70 62 62 66 50 66 C38 66 30 62 30 46 Z"
          fill={spec.hair}
          opacity="0.85"
        />
      )}
      {(spec.beard === 'mustache' || spec.beard === 'full') && (
        <path
          d="M43 52.5 C45.5 51 48.5 51.5 50 53 C51.5 51.5 54.5 51 57 52.5 C56 55.5 44 55.5 43 52.5 Z"
          fill={spec.hair}
          opacity={spec.beard === 'full' ? 0.85 : 0.7}
        />
      )}
      {/* óculos */}
      {spec.glasses && (
        <g stroke="#0f0d0c" strokeWidth="2" fill="none" opacity="0.9">
          <rect x="32" y="36" width="16" height="12" rx="4" />
          <rect x="52" y="36" width="16" height="12" rx="4" />
          <line x1="48" y1="41" x2="52" y2="41" />
        </g>
      )}
      {/* acessórios */}
      {spec.accessory === 'tie' && (
        <g>
          <path d="M47 71 L53 71 L52 76 L48 76 Z" fill={spec.accent} />
          <rect x="47" y="75" width="6" height="21" rx="2" fill={spec.accent} />
        </g>
      )}
      {spec.accessory === 'pin' && <circle cx="33" cy="85" r="3.2" fill={spec.accent} />}
      {spec.accessory === 'scarf' && (
        <path
          d="M30 70 C40 81 60 81 70 70 L70 80 C58 88 42 88 30 80 Z"
          fill={spec.accent}
          opacity="0.85"
        />
      )}
      {spec.accessory === 'earpiece' && <circle cx="72" cy="50" r="3" fill={spec.accent} />}
      {spec.accessory === 'earrings' && (
        <g fill={spec.accent}>
          <circle cx={earX} cy="48.5" r="1.7" />
          <circle cx={100 - earX} cy="48.5" r="1.7" />
        </g>
      )}
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,162,75,0.35)" strokeWidth="2" />
    </svg>
  );
}
