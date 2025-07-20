import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { insertText } from '@/api/lightrag'

interface AddTextDocumentDialogProps {
  onDocumentAdded?: () => void
}

export default function AddTextDocumentDialog({ onDocumentAdded }: AddTextDocumentDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(t('documentPanel.addTextDocument.errors.titleRequired'))
      return
    }

    if (!content.trim()) {
      toast.error(t('documentPanel.addTextDocument.errors.contentRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      // Create the text content with title and body
      const textContent = `# ${title.trim()}\n\n${content.trim()}`
      
      // Create a shortened file source from the title (max 10 characters)
      const shortenedTitle = title.trim().substring(0, 10)
      
      // Use the insertText API to add the text directly with custom file source
      await insertText(textContent, shortenedTitle)

      // Reset form
      setTitle('')
      setContent('')
      setOpen(false)
      
      toast.success(t('documentPanel.addTextDocument.success', { title: title.trim() }))
      
      // Trigger refresh of documents list
      if (onDocumentAdded) {
        onDocumentAdded()
      }
    } catch (error) {
      console.error('Error adding text document:', error)
      toast.error(error instanceof Error ? error.message : t('documentPanel.addTextDocument.errors.uploadFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setContent('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          tooltip={t('documentPanel.addTextDocument.tooltip')}
        >
          <PlusIcon className="h-4 w-4" />
          {t('documentPanel.addTextDocument.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('documentPanel.addTextDocument.title')}</DialogTitle>
          <DialogDescription>
            {t('documentPanel.addTextDocument.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="space-y-2">
            <label htmlFor="document-title" className="text-sm font-medium">
              {t('documentPanel.addTextDocument.titleLabel')}
            </label>
            <Input
              id="document-title"
              placeholder={t('documentPanel.addTextDocument.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <label htmlFor="document-content" className="text-sm font-medium">
              {t('documentPanel.addTextDocument.contentLabel')}
            </label>
            <textarea
              id="document-content"
              placeholder={t('documentPanel.addTextDocument.contentPlaceholder')}
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 min-h-[200px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? t('documentPanel.addTextDocument.adding') : t('documentPanel.addTextDocument.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
