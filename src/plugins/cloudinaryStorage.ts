/**
 * Cloudinary Storage Plugin for Payload CMS v3
 *
 * CLOUDINARY_CLOUD_NAME 환경변수가 없으면 로컬 스토리지로 폴백합니다 (개발 환경).
 * 프로덕션에서는 반드시 세 환경변수를 모두 설정하세요.
 *
 * Required env:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
import type { Plugin } from 'payload'
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary'

const uploadStream = (
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'))
        resolve(result as { secure_url: string; public_id: string })
      })
      .end(buffer)
  })

export const cloudinaryStorage = (): Plugin =>
  (config) => {
    const isEnabled =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET

    if (!isEnabled) return config

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    })

    return {
      ...config,
      collections: config.collections?.map((col) => {
        if (col.slug !== 'media') return col

        return {
          ...col,
          upload: {
            ...(typeof col.upload === 'object' && col.upload !== null ? col.upload : {}),
            disableLocalStorage: true,
            imageSizes: undefined,
          },
          hooks: {
            ...col.hooks,
            afterRead: [
              ...(col.hooks?.afterRead ?? []),
              ({ doc }) => {
                const cldId = (doc as Record<string, unknown>).cloudinaryId as string | undefined
                if (!cldId) return doc
                if ((doc.url as string | undefined)?.includes('cloudinary.com')) return doc
                return {
                  ...doc,
                  url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cldId}`,
                }
              },
            ],
            beforeChange: [
              ...(col.hooks?.beforeChange ?? []),
              async ({ data, req, operation }) => {
                if (operation !== 'create') return data
                if (!req.file) return data

                const publicId = (data.filename as string | undefined)
                  ?.replace(/\.[^.]+$/, '')
                  .replace(/\s+/g, '-')

                const result = await uploadStream(req.file.data, {
                  folder: 'web3people',
                  public_id: publicId,
                  resource_type: 'image',
                  overwrite: true,
                  transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                })

                // cloudinaryId를 data에 먼저 저장
                // url은 Payload가 afterChange 이전에 덮어쓰므로 afterChange에서 처리
                return {
                  ...data,
                  cloudinaryId: result.public_id,
                  _cloudinaryUrl: result.secure_url, // 임시 전달용
                }
              },
            ],
            afterChange: [
              ...(col.hooks?.afterChange ?? []),
              async ({ doc, req, operation }) => {
                if (operation !== 'create') return doc
                // cloudinaryId가 있고 url이 Cloudinary URL이 아닌 경우 수정
                const cldId = (doc as Record<string, unknown>).cloudinaryId as string | undefined
                const currentUrl = (doc as Record<string, unknown>).url as string | undefined
                const tempUrl = (doc as Record<string, unknown>)._cloudinaryUrl as string | undefined

                if (!cldId) return doc

                // Cloudinary URL 구성 (임시 전달값 또는 cloudinaryId로 재구성)
                const cloudinaryUrl =
                  tempUrl ??
                  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cldId}`

                if (currentUrl === cloudinaryUrl) return doc

                // 직접 DB 업데이트 (hooks 재호출 방지)
                await req.payload.db.updateOne({
                  collection: 'media',
                  id: doc.id,
                  data: { url: cloudinaryUrl },
                  req,
                })

                return { ...doc, url: cloudinaryUrl }
              },
            ],
            afterDelete: [
              ...(col.hooks?.afterDelete ?? []),
              async ({ doc }) => {
                const id = (doc as Record<string, unknown>).cloudinaryId as string | undefined
                if (!id) return
                try {
                  await cloudinary.uploader.destroy(id)
                } catch {
                  // 삭제 실패는 치명적이지 않으므로 무시
                }
              },
            ],
          },
        }
      }),
    }
  }
