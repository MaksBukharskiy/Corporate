import type { ReactNode } from 'react';
import { categoryCover, categoryLabel, formatIsoDate, telHref } from '../data';
import type { Merchant, MerchantReview, Offer, User } from '../types';
import { CourseCard, offerPrice } from './offerGrid';

function avgRating(rows: MerchantReview[]) {
  if (!rows.length) return 0;
  return rows.reduce((s, r) => s + r.rating, 0) / rows.length;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="review-stars" aria-label={`${value.toFixed(1)} из 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="review-stars-off">{'★★★★★'.slice(full)}</span>
    </span>
  );
}

export function ReviewStrip({ reviews, title = 'Отзывы · учёба' }: { reviews: MerchantReview[]; title?: string }) {
  if (!reviews.length) return null;
  return (
    <section className="review-strip">
      <h2>{title}</h2>
      <div className="review-list">
        {reviews
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((r) => (
            <article key={r.id} className="review-card">
              <div className="review-card-top">
                <div className="review-who">
                  <span className="review-avatar">{initials(r.author)}</span>
                  <b>{r.author}</b>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.course ? <div className="review-course">{r.course}</div> : null}
              <p>{r.text}</p>
              <p className="meta">{formatIsoDate(r.date)}</p>
            </article>
          ))}
      </div>
    </section>
  );
}

export function MerchantShowcase({
  merchant,
  owner,
  offers,
  reviews,
  onOpenOffer,
  offerFooterRight,
}: {
  merchant: Merchant;
  owner?: User;
  offers: Offer[];
  reviews: MerchantReview[];
  onOpenOffer?: (offer: Offer) => void;
  offerFooterRight?: (offer: Offer) => ReactNode;
}) {
  const rating = avgRating(reviews);
  const ratingLabel = rating ? rating.toFixed(1) : '—';
  const cover = merchant.coverUrl || categoryCover[merchant.category];
  const gallery = merchant.gallery?.filter(Boolean) ?? [];

  return (
    <div className="merchant-public">
      <div className="merchant-hero-banner">
        <img src={cover} alt="" />
        <div className="merchant-hero-overlay">
          <div className="kicker">Мерчант · {categoryLabel[merchant.category]}</div>
          <h1>{merchant.name}</h1>
          <p className="merchant-hero-org">{owner?.name ?? 'Команда мерчанта'}</p>
          <p className="merchant-hero-meta">
            {owner?.email ? `${owner.email} · ` : ''}
            {merchant.city}
            {merchant.phone ? ` · ${merchant.phone}` : ''}
          </p>
          {merchant.about ? <p className="merchant-about">{merchant.about}</p> : null}
          <div className="merchant-stats">
            <div>
              <b>{ratingLabel}</b>
              <span>рейтинг</span>
            </div>
            <div>
              <b>{reviews.length}</b>
              <span>отзывов</span>
            </div>
            <div>
              <b>{offers.length}</b>
              <span>курсов</span>
            </div>
          </div>
          {merchant.phone ? (
            <a className="hr-phone" href={telHref(merchant.phone)}>
              {merchant.phone}
            </a>
          ) : null}
        </div>
      </div>

      {gallery.length ? (
        <div className="merchant-gallery">
          {gallery.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      ) : null}

      <h2>Услуги · курсы</h2>
      {offers.length ? (
        <div className="offer-grid">
          {offers.map((o) => (
            <CourseCard
              key={o.id}
              offer={o}
              dim={!o.active}
              showDescription
              onOpen={() => onOpenOffer?.(o)}
              footerLeft={offerPrice(o)}
              footerRight={
                offerFooterRight?.(o) ?? <span className={o.active ? 'ok' : 'warn'}>{o.active ? 'Активна' : 'Скрыта'}</span>
              }
            />
          ))}
        </div>
      ) : (
        <p className="meta">Услуг пока нет.</p>
      )}

      {reviews.length ? <ReviewStrip reviews={reviews} /> : <p className="meta">Отзывов пока нет.</p>}
    </div>
  );
}
