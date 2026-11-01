import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProductDetailClient } from './detail-client'
import {
  ROADSTER_PRODUCT,
  isPremiumVip,
  isRoadsterProduct,
  applyRoadsterDiscount,
} from '@/lib/data/roadster-defaults'
import { VipLockedCard } from '@/components/vip-locked-card'
import { PlatformShell } from '@/components/platform-shell'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  const baseProduct = dbProduct || (id === ROADSTER_PRODUCT.id ? ROADSTER_PRODUCT : null)

  if (!baseProduct) notFound()

  const isRoadster = isRoadsterProduct(id, baseProduct.name)
  const userIsPremiumVip = isPremiumVip(profile)

  // Gate flying car vehicle deal behind Premium VIP ($2,000+)
  if (isRoadster && !userIsPremiumVip) {
    return (
      <PlatformShell>
        <VipLockedCard
          title={baseProduct.name}
          description="Access to the Tesla Next-Gen Flying Roadster (SpaceX Thruster Package) allocation is strictly reserved for Premium VIP members ($2,000+ / Platinum). Upgrade your membership to unlock purchase reservation and enjoy an automatic 15% discount ($37,500 savings)."
          returnUrl="/inventory"
        />
      </PlatformShell>
    )
  }

  // Apply 15% discount for Premium VIP members
  const product = isRoadster
    ? { ...baseProduct, price: applyRoadsterDiscount(Number(baseProduct.price)) }
    : baseProduct

  return <ProductDetailClient product={product} userId={user.id} />
}
