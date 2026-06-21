export type Testimonial = {
  id: string
  quote: string
  name: string
  title: string
  company: string
}

/** Populated when real UE5 client testimonials are available */
export const testimonials: Testimonial[] = []
