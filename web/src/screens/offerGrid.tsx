import { type ReactNode, useEffect, useState } from 'react';
import { BookOpen, Car, Dumbbell, HeartPulse, PartyPopper, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { categoryAccent, categoryCover, categoryLabel } from '../data';
import type { Category, Offer } from '../types';

const categoryIcon: Record<Category, LucideIcon> = {
  sport: Dumbbell,
  food: UtensilsCrossed,
  education: BookOpen,
  health: HeartPulse,
  transport: Car,
  events: PartyPopper,
};

export function offerPrice(o: Pick<Offer, 'paid' | 'points'>) {
  return o.paid && o.points > 0 ? `${o.points} баллов` : 'бесплатно';
}

export function OfferCover({ category, imageUrl }: { category: Category; imageUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const Icon = categoryIcon[category];
  const src = imageUrl?.trim() || categoryCover[category];
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (failed) {
    return (
      <div className="course-cover fallback" style={{ background: `linear-gradient(155deg, ${categoryAccent[category]} 0%, #246BFD 100%)` }}>
        <Icon size={36} strokeWidth={1.75} />
      </div>
    );
  }
  return (
    <div className="course-cover">
      <img src={src} alt="" onError={() => setFailed(true)} />
    </div>
  );
}

export function CourseCard({
  offer,
  footerLeft,
  footerRight,
  dim,
  showDescription,
  onOpen,
}: {
  offer: Offer;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  dim?: boolean;
  showDescription?: boolean;
  onOpen: () => void;
}) {
  return (
    <article
      className={`course-card${dim ? ' dim' : ''}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <OfferCover category={offer.category} imageUrl={offer.image} />
      <div className="course-body">
        <div className="course-kicker">{categoryLabel[offer.category]}</div>
        <div className="course-title">{offer.title}</div>
        {showDescription && offer.description ? <div className="course-desc">{offer.description}</div> : null}
        <div className="course-foot">
          <span>{footerLeft ?? offerPrice(offer)}</span>
          {footerRight}
        </div>
      </div>
    </article>
  );
}
