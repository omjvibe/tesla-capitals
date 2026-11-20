import dns from 'node:dns'

// Force IPv4-first DNS resolution to prevent Undici IPv6 connect timeouts on dual-stack networks
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
