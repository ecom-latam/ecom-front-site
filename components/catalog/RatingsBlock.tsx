import { StarRating } from 'zoui';
import type { StarRatingVariant } from 'zoui';
import type { ProductReview } from '@/lib/api/storeClient';

interface RatingsBlockProps {
  avgRating: number | null;
  total: number;
  reviews: ProductReview[];
  ratingsEnabled: boolean;
  reviewsEnabled: boolean;
  starVariant?: StarRatingVariant;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <StarRating value={review.rating} readonly size="sm" variant="filled" />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--color-fg-disabled)',
          }}
        >
          {formatDate(review.createdAt)}
        </span>
      </div>

      {review.title && (
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-fg-primary)',
            margin: 0,
          }}
        >
          {review.title}
        </p>
      )}

      {review.body && (
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            color: 'var(--color-fg-secondary)',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {review.body}
        </p>
      )}
    </div>
  );
}

export function RatingsBlock({
  avgRating,
  total,
  reviews,
  ratingsEnabled,
  reviewsEnabled,
  starVariant = 'filled',
}: RatingsBlockProps) {
  if (!ratingsEnabled && !reviewsEnabled) return null;

  const hasRatings = ratingsEnabled && avgRating !== null && total > 0;
  const hasReviews = reviewsEnabled && reviews.length > 0;

  if (!hasRatings && !hasReviews) {
    if (!reviewsEnabled) return null;
    return (
      <section style={{ marginTop: '48px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-fg-primary)',
            marginBottom: '16px',
          }}
        >
          Reseñas
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            color: 'var(--color-fg-secondary)',
          }}
        >
          Todavía no hay reseñas para este producto.
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: '48px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-fg-primary)',
            margin: 0,
          }}
        >
          Reseñas
        </h2>

        {hasRatings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating
              value={avgRating!}
              readonly
              showValue
              count={total}
              variant={starVariant}
              size="md"
            />
          </div>
        )}
      </div>

      {hasReviews && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      )}

      {reviewsEnabled && total > reviews.length && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--color-fg-secondary)',
            }}
          >
            Mostrando {reviews.length} de {total} reseñas
          </span>
        </div>
      )}
    </section>
  );
}
