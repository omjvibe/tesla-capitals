import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProductDetailClient } from './detail-client'
import { ROADSTER_PRODUCT } from '@/lib/data/roadster-defaults'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  const product = dbProduct || (id === ROADSTER_PRODUCT.id ? ROADSTER_PRODUCT : null)

  if (!product) notFound()

  return <ProductDetailClient product={product} userId={user.id} />
}

