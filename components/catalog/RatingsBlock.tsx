import { StarRating, Text } from 'zoui';
import type { ProductReview, ReviewDistribution } from '@/lib/api/storeClient';

interface RatingsBlockProps {
  avgRating: number | null;
  total: number;
  reviews: ProductReview[];
  distribution: ReviewDistribution | null;
  ratingsEnabled: boolean;
  reviewsEnabled: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getBuyerDisplay(email?: string): { initial: string; name: string } {
  if (!email) return { initial: 'C', name: 'Comprador verificado' };
  const prefix = email.split('@')[0] ?? '';
  const display = prefix.replace(/[._-]/g, ' ').trim();
  return { initial: display[0]?.toUpperCase() ?? 'C', name: display || 'Comprador verificado' };
}

function DistributionBars({
  distribution,
  total,
}: {
  distribution: ReviewDistribution;
  total: number;
}) {
  const rows = [5, 4, 3, 2, 1] as const;
  return (
    <div className="zoui-product__bars">
      {rows.map((star) => {
        const count = distribution[star] ?? 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="zoui-product__bar-row">
            <StarRating value={star} readonly size="sm" />
            <div className="zoui-product__bar">
              <div className="zoui-product__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="zoui-product__bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: ProductReview;
}) {
  const { initial, name } = getBuyerDisplay(review.buyerEmail);
  return (
    <div className="zoui-product__review">
      <div className="zoui-product__review-head">
        <div className="zoui-product__avatar">{initial}</div>
        <div className="zoui-product__review-author">
          <strong>{name}</strong>
          <span>{formatDate(review.createdAt)}</span>
        </div>
        <div className="zoui-product__review-stars">
          <StarRating value={review.rating} readonly size="sm" />
        </div>
      </div>

      {review.title && <p className="zoui-product__review-title">{review.title}</p>}

      {review.body && <p className="zoui-product__review-body">{review.body}</p>}
    </div>
  );
}

export function RatingsBlock({
  avgRating,
  total,
  reviews,
  distribution,
  ratingsEnabled,
  reviewsEnabled,
}: RatingsBlockProps) {
  if (!ratingsEnabled && !reviewsEnabled) return null;

  const hasRatings = ratingsEnabled && avgRating !== null && total > 0;
  const hasReviews = reviewsEnabled && reviews.length > 0;

  if (!hasRatings && !hasReviews) {
    if (!reviewsEnabled) return null;
    return (
      <section className="zoui-product__reviews">
        <h2 className="zoui-product__section-title">Reseñas</h2>
        <Text variant="body-sm" color="secondary">Todavía no hay reseñas para este producto.</Text>
      </section>
    );
  }

  return (
    <section className="zoui-product__reviews">
      <h2 className="zoui-product__section-title">Reseñas</h2>

      {hasRatings && (
        <div className="zoui-product__summary">
          <div className="zoui-product__summary-main">
            <span className="zoui-product__score">{avgRating!.toFixed(1)}</span>
            <StarRating value={avgRating!} readonly showValue={false} size="md" />
            <span className="zoui-product__muted">
              {total} {total === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>

          {distribution && (
            <DistributionBars distribution={distribution} total={total} />
          )}
        </div>
      )}

      {hasReviews && (
        <div className="zoui-product__review-list">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      )}

      {reviewsEnabled && total > reviews.length && (
        <div className="zoui-product__more">
          <span className="zoui-product__muted">
            Mostrando {reviews.length} de {total} reseñas
          </span>
        </div>
      )}
    </section>
  );
}
