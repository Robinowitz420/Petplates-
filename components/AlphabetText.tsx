'use client';

import Image from 'next/image';

type AlphabetTextProps = {
  text: string;
  size?: number;
  className?: string;
  gapPx?: number;
  spaceWidthEm?: number;
};

function isLetterAZ(ch: string): boolean {
  return ch.length === 1 && ch.toLowerCase() >= 'a' && ch.toLowerCase() <= 'z';
}

function isDigit(ch: string): boolean {
  return ch.length === 1 && ch >= '0' && ch <= '9';
}

export default function AlphabetText({
  text,
  size = 24,
  className = '',
  gapPx = 2,
  spaceWidthEm = 0.55,
}: AlphabetTextProps) {
  const safeText = typeof text === 'string' ? text : '';
  const scale = (1 / 3) * 1.3;
  const renderSize = Math.max(1, Math.round(size * scale));
  const renderGapPx = Math.max(0, Math.round(gapPx * scale));
  const renderSpaceWidthPx = Math.max(0, Math.round(renderSize * spaceWidthEm));

  const words = safeText.trim().split(/\s+/).filter(Boolean);
  const shouldSplit = words.length > 4;

  const renderCharacters = (segmentText: string, segmentKey: string) => {
    const chars = Array.from(segmentText);
    return chars.map((ch, idx) => {
      const isLast = idx === chars.length - 1;
      const key = `${segmentKey}-${idx}-${ch}`;

      if (ch === '&') {
        return (
          <Image
            key={key}
            src="/images/Buttons/Alphabet/AND.png"
            alt=""
            width={renderSize}
            height={renderSize}
            className="object-contain"
            style={{ marginRight: isLast ? 0 : renderGapPx }}
          />
        );
      }

      if (isDigit(ch)) {
        return (
          <Image
            key={key}
            src={`/images/Buttons/Alphabet/NUMBERS/${ch}.png`}
            alt=""
            width={renderSize}
            height={renderSize}
            className="object-contain"
            style={{ marginRight: isLast ? 0 : renderGapPx }}
          />
        );
      }

      if (ch === '%') {
        return (
          <Image
            key={key}
            src="/images/Buttons/Alphabet/NUMBERS/PERCENT.png"
            alt=""
            width={renderSize}
            height={renderSize}
            className="object-contain"
            style={{ marginRight: isLast ? 0 : renderGapPx }}
          />
        );
      }

      if (ch === '-') {
        return (
          <Image
            key={key}
            src="/images/Buttons/Alphabet/Dash.png"
            alt=""
            width={renderSize}
            height={renderSize}
            className="object-contain"
            style={{ marginRight: isLast ? 0 : renderGapPx }}
          />
        );
      }

      if (isLetterAZ(ch)) {
        const lower = ch.toLowerCase();
        return (
          <Image
            key={key}
            src={`/images/Buttons/Alphabet/${lower}.png`}
            alt=""
            width={renderSize}
            height={renderSize}
            className="object-contain"
            style={{ marginRight: isLast ? 0 : renderGapPx }}
          />
        );
      }

      if (ch === ' ') {
        return (
          <span
            key={key}
            aria-hidden="true"
            style={{
              width: renderSpaceWidthPx,
              height: renderSize,
              display: 'inline-block',
            }}
          />
        );
      }

      return (
        <span
          key={key}
          aria-hidden="true"
          className="inline-flex items-center"
          style={{
            height: renderSize,
            fontSize: Math.max(8, Math.round(renderSize * 0.75)),
            lineHeight: 1,
            marginRight: isLast ? 0 : renderGapPx,
          }}
        >
          {ch}
        </span>
      );
    });
  };

  const renderLine = (lineText: string, lineIndex: number) => (
    <span
      key={`line-${lineIndex}`}
      className="inline-flex flex-wrap items-center justify-center"
      style={{
        marginTop: lineIndex === 0 ? 0 : Math.round(renderSize * 0.3),
      }}
    >
      {renderCharacters(lineText, `seg-${lineIndex}`)}
    </span>
  );

  return (
    <span
      className={`${shouldSplit ? 'inline-flex flex-col items-center text-center' : 'inline-flex flex-wrap items-center'} ${className}`}
      aria-label={safeText}
    >
      {shouldSplit
        ? (() => {
            const midpoint = Math.ceil(words.length / 2);
            const firstLine = words.slice(0, midpoint).join(' ');
            const secondLine = words.slice(midpoint).join(' ');
            return (
              <>
                {renderLine(firstLine, 0)}
                {renderLine(secondLine, 1)}
              </>
            );
          })()
        : renderLine(safeText, 0)}
    </span>
  );
}
