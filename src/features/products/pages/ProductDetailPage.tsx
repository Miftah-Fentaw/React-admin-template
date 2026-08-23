import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/Feedback'
import { Skeleton } from '@/components/ui/Skeleton'
import { NotFoundError } from '@/services/api/errors'
import { formatCurrency, formatDate } from '@/lib/format'
import { formatCategory } from '@/components/display/status-badges'
import { useProduct } from '../hooks/use-products'
import { ProductFormDialog } from '../components/ProductFormDialog'

/** Read-only catalog item view. */
export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const product = useProduct(productId)
  const isNotFound = product.error instanceof NotFoundError

  return (
    <>
      <PageHeader
        title={product.data?.name ?? 'Product details'}
        description={product.data?.sku}
        actions={
          product.data && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
          )
        }
      />

      <div className="detail-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to products
        </Button>
      </div>

      {product.isPending && (
        <div className="detail-grid">
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton style={{ height: 22, width: 220 }} />
              <Skeleton style={{ height: 16, width: 300 }} />
            </CardContent>
          </Card>
        </div>
      )}

      {product.isError &&
        (isNotFound ? (
          <ErrorState
            title="Product not found"
            message="This product may have been deleted."
            onRetry={() => navigate('/products')}
          />
        ) : (
          <ErrorState
            message="Could not load this product."
            onRetry={() => product.refetch()}
          />
        ))}

      {product.isSuccess && (
        <div className="detail-grid">
          <div className="detail-stack">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>
                  {product.data.name}
                </h2>
                {product.data.description !== null ? (
                  <p
                    className="text-sm"
                    style={{ lineHeight: 1.6, color: 'var(--muted-foreground)' }}
                  >
                    {product.data.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted">No description provided.</p>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <Badge tone="primary">{formatCategory(product.data.category)}</Badge>
                  {product.data.status === 'active' && (
                    <Badge tone="success" dot>
                      Active
                    </Badge>
                  )}
                  {product.data.status === 'draft' && (
                    <Badge tone="warning" dot>
                      Draft
                    </Badge>
                  )}
                  {product.data.status === 'archived' && <Badge>Archived</Badge>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="detail-stack">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & stock</CardTitle>
              </CardHeader>
              <CardContent style={{ paddingTop: 8 }}>
                <ul role="list" className="meta-list">
                  <li className="meta-list__row">
                    <span className="meta-list__label">Price</span>
                    <span className="meta-list__value tabular">
                      {formatCurrency(product.data.price, { precise: true })}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Inventory</span>
                    <span className="meta-list__value tabular">
                      {product.data.inventory}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">SKU</span>
                    <span className="meta-list__value mono">{product.data.sku}</span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Added</span>
                    <span className="meta-list__value">
                      {formatDate(product.data.createdAt)}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Last updated</span>
                    <span className="meta-list__value">
                      {formatDate(product.data.updatedAt)}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {product.data && (
        <ProductFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          product={product.data}
        />
      )}
    </>
  )
}
