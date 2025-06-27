import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServices } from '@/hooks/useServices'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const categoryOptions = [
  { value: 'buffet', label: 'Buffet' },
  { value: 'bar', label: 'Bar' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'venue', label: 'Venue' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'music', label: 'Music' },
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'cake', label: 'Cake & Desserts' },
  { value: 'other', label: 'Other' }
]

export const ProviderSetupForm = () => {
  const router = useRouter()
  const { auth } = useServices()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const businessName = formData.get('businessName') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string

    try {
      await auth.createProviderProfile({
        business_name: businessName,
        description,
        category,
        address,
        city,
        state
      })

      router.push('/dashboard/provider')
      router.refresh()
    } catch (error) {
      setError('Error creating provider profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <Input
          type="text"
          name="businessName"
          placeholder="Business Name"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <textarea
          name="description"
          placeholder="Business Description"
          className="w-full p-2 border rounded-md"
          rows={4}
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Select
          name="category"
          options={categoryOptions}
          required
          disabled={isLoading}
          placeholder="Select a category"
        />
      </div>
      <div>
        <Input
          type="text"
          name="address"
          placeholder="Address"
          required
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          name="city"
          placeholder="City"
          required
          disabled={isLoading}
        />
        <Input
          type="text"
          name="state"
          placeholder="State"
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating profile...' : 'Complete setup'}
      </Button>
    </form>
  )
} 