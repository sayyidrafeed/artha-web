import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from './api'

describe('api client', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
        vi.spyOn(console, 'log').mockImplementation(() => { })
    })

    describe('post', () => {
        it('should send correct JSON payload and return data', async () => {
            const mockResponse = { success: true, data: { id: '1' } }
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                headers: new Map([['Content-Type', 'application/json']]),
                json: async () => mockResponse,
            } as any)

            const result = await api.post('/test', { name: 'test' })

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: 'test' }),
            }))
            expect(result).toEqual(mockResponse)
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[API] POST'), { name: 'test' })
        })

        it('should throw ApiError with details on 400 response', async () => {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: [{ code: 'required', message: 'Field is required', path: ['name'] }]
                }
            }
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Map([['Content-Type', 'application/json']]),
                json: async () => errorResponse,
            } as any)

            try {
                await api.post('/test', {})
                expect.fail('Should have thrown ApiError')
            } catch (err) {
                expect(err).toBeInstanceOf(ApiError)
                const apiErr = err as ApiError
                expect(apiErr.status).toBe(400)
                expect(apiErr.code).toBe('VALIDATION_ERROR')
                expect(apiErr.message).toBe('Invalid input')
                expect(apiErr.details).toEqual(errorResponse.error.details)
            }
        })

        it('should throw generic error for non-json error responses', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                headers: new Map(),
                json: async () => { throw new Error() },
            } as any)

            await expect(api.post('/test', {})).rejects.toThrow('API error: 500')
        })
    })

    describe('get', () => {
        it('should handle query parameters correctly', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                headers: new Map([['Content-Type', 'application/json']]),
                json: async () => ({ success: true, data: [] }),
            } as any)

            await api.get('/test', { page: 1, filter: 'active' })

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test?page=1&filter=active'), expect.any(Object))
        })
    })
})
