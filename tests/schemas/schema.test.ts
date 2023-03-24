import { contactSchema } from "@src/schemas/schemas"

const buildRawContact = (data: any = {}) => {
  return {
    name: "John-Doe",
    date_of_birth: "1990-01-01",
    phone: "(+01) 555-123-45-67",
    address: "123 Main St",
    credit_card_number: "1234567890123456",
    email: "john.doe@example.com",
    ...data,
  }
}

describe("contactSchema", () => {
  describe("name", () => {
    it("should not be empty", () => {
      const data = buildRawContact({ name: "" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("too_small")
        expect(result.error.issues[0].path[0]).toBe("name")
      }
    })

    it("should not have special character", () => {
      const data = buildRawContact({ name: "John (Doe)" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("name")
      }
    })

    it('should allow "-"', () => {
      const data = buildRawContact({ name: "John-Doe" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe("date_of_birth", () => {
    it("invalid date of birth", () => {
      const data = buildRawContact({ date_of_birth: "01-01-1990" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_date")
        expect(result.error.issues[0].path[0]).toBe("date_of_birth")
      }
    })

    it("should allow date in format YYYYMMDD", () => {
      const data = buildRawContact({ date_of_birth: "19900101" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("should allow date in format YYYY-MM-DD", () => {
      const data = buildRawContact({ date_of_birth: "1990-01-01" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe("phone", () => {
    it("invalid phone", () => {
      const data = buildRawContact({ phone: "555-123-4567" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("phone")
      }
    })

    it("should allow phone in format (+00) 000 000 00 00 00", () => {
      const data = buildRawContact({ phone: "(+01) 555 123 45 67" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("should allow phone in format (+00) 000-000-00-00-00", () => {
      const data = buildRawContact({ phone: "(+01) 555-123-45-67" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe("address", () => {
    it("should not be empty", () => {
      const data = buildRawContact({ address: "" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("too_small")
        expect(result.error.issues[0].path[0]).toBe("address")
      }
    })

    it("should allow any string", () => {
      const data = buildRawContact({ address: "foo" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe("credit_card_number", () => {
    it("should only allow numbers", () => {
      const data = buildRawContact({ credit_card_number: "1234567890123456" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("should fail if bigger than 19 digits", () => {
      const data = buildRawContact({ credit_card_number: "1234567890123456786549" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("credit_card_number")
      }
    })

    it("should fail if smaller than 13 digits", () => {
      const data = buildRawContact({ credit_card_number: "123456789" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("credit_card_number")
      }
    })

    it("should fail if not only numbers", () => {
      const data = buildRawContact({ credit_card_number: "1234567890123a" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("credit_card_number")
      }
    })
  })

  describe("email", () => {
    it("should be a valid email", () => {
      const data = buildRawContact({ email: "foo@bar.com" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it("should fail if not a valid email", () => {
      const data = buildRawContact({ email: "foo" })

      const result = contactSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_string")
        expect(result.error.issues[0].path[0]).toBe("email")
      }
    })
  })
})
