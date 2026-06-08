"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  List,
  PawPrint,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PrivateImage } from "@/components/common/PrivateImage";
import { Spinner } from "@/components/ui/Spinner";
import {
  addPetDocument,
  deletePetDocument,
  getPetDocuments,
  uploadDocumentFile,
} from "@/features/documents/documents-api.service";
import { getColorForPet } from "@/features/pets/pet-theme-colors";
import type { Pet, PetDocument } from "@/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type FormState = { name: string; issuedDate: string; file: File | null };

const emptyForm: FormState = { name: "", issuedDate: "", file: null };

function formatDisplayDate(value: string) {
  if (!value) return "";
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  return value;
}

function formatIssuedDateForApi(value: string) {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }
  return value.trim();
}

function isValidIssuedDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31 &&
    year >= 1900 &&
    year <= 2100
  );
}

function isImageMimeType(mimeType?: string) {
  return Boolean(mimeType?.startsWith("image/"));
}

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setItemsPerPage(w >= 1024 ? 5 : w >= 768 ? 3 : 1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return itemsPerPage;
}

type DocumentFormFieldProps = {
  id: string;
  label: string;
  value: string;
  inputMode?: "text" | "numeric";
  error?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

function DocumentFormField({
  id,
  label,
  value,
  inputMode,
  error,
  onChange,
  onBlur,
}: DocumentFormFieldProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="block text-[0.98rem] leading-none font-medium text-[#1a202c]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "h-11 w-full rounded-[14px] border bg-white px-4 pr-11 text-[1rem] text-[#1a202c] transition outline-none",
            "hover:border-[#7a7878] focus:ring-2 focus:ring-[#1a202c]/15",
            error ? "border-[#b91c1c]" : "border-[#1a202c]",
          )}
        />
        <Pencil
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
          strokeWidth={1.8}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-[#b91c1c]">{error}</p>
      ) : null}
    </div>
  );
}

function DocumentThumbnail({ doc }: { doc: PetDocument }) {
  if (!doc.mimeType || isImageMimeType(doc.mimeType)) {
    return (
      <PrivateImage
        fileId={doc.fileId}
        alt={doc.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f0ebe4]">
      <FileText className="h-1/3 w-1/3 text-[#c9b99a]" aria-hidden="true" />
    </div>
  );
}

function DocumentCard({
  doc,
  onDelete,
}: {
  doc: PetDocument;
  onDelete: (id: string) => void;
}) {
  const label = `${doc.name} ${formatDisplayDate(doc.issuedDate)}`;
  return (
    <div className="group flex flex-col items-center gap-2">
      <div className="h-[100px] w-full overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-[#f7f7f7] transition group-hover:border-[#c8c8c8]">
        <DocumentThumbnail doc={doc} />
      </div>
      <p className="w-full text-center text-[0.82rem] leading-tight font-medium text-[#1a202c]">
        {label}
      </p>
      <button
        type="button"
        aria-label={`Delete ${label}`}
        onClick={() => onDelete(doc.id)}
        className="text-[#e53e3e] transition hover:text-[#c53030] focus-visible:ring-2 focus-visible:ring-[#e53e3e]/40 focus-visible:ring-offset-1 focus-visible:outline-none"
      >
        <Trash2 className="h-5 w-5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function DocumentRow({
  doc,
  onDelete,
}: {
  doc: PetDocument;
  onDelete: (id: string) => void;
}) {
  const label = `${doc.name} ${formatDisplayDate(doc.issuedDate)}`;
  return (
    <div className="flex items-center gap-4 border-b border-[#e2e8f0] py-3 transition last:border-b-0 hover:bg-[#fafafa]">
      <span className="min-w-0 flex-1 text-[0.98rem] font-medium text-[#1a202c]">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Delete ${label}`}
        onClick={() => onDelete(doc.id)}
        className="shrink-0 text-[#e53e3e] transition hover:text-[#c53030] focus-visible:ring-2 focus-visible:ring-[#e53e3e]/40 focus-visible:outline-none"
      >
        <Trash2 className="h-5 w-5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function DocumentsGallery({
  documents,
  onDelete,
}: {
  documents: PetDocument[];
  onDelete: (id: string) => void;
}) {
  const itemsPerPage = useItemsPerPage();
  const [page, setPage] = useState(0);

  useEffect(() => {
    void Promise.resolve().then(() => setPage(0));
  }, [documents.length, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(documents.length / itemsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const currentDocs = documents.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage,
  );

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={safePage === 0}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        className="shrink-0 text-[#1a202c] transition hover:text-[#1a202c]/60 focus-visible:outline-none disabled:cursor-default disabled:text-[#1a202c]/20"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div
        className="grid min-w-0 flex-1 gap-4"
        style={{
          gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
        }}
      >
        {currentDocs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onDelete={onDelete} />
        ))}
        {Array.from({ length: itemsPerPage - currentDocs.length }).map(
          (_, i) => (
            <div key={`empty-${i}`} aria-hidden="true" />
          ),
        )}
      </div>

      <button
        type="button"
        aria-label="Next page"
        disabled={safePage >= totalPages - 1}
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        className="shrink-0 text-[#1a202c] transition hover:text-[#1a202c]/60 focus-visible:outline-none disabled:cursor-default disabled:text-[#1a202c]/20"
      >
        <ChevronRight
          className="h-6 w-6"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

type DocumentsTabProps = {
  pet: Pet;
  avatarPreviewUrl: string | null;
  uploadingAvatar: boolean;
  onAvatarClick: () => void;
};

export function DocumentsTab({
  pet,
  avatarPreviewUrl,
  uploadingAvatar,
  onAvatarClick,
}: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  const isFormComplete =
    form.name.trim() !== "" &&
    form.issuedDate.trim() !== "" &&
    form.file !== null;

  const borderColor = getColorForPet(pet.themeColor);

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setLoadError(null);
        const docs = await getPetDocuments(pet.id, signal);
        if (!signal?.aborted) setDocuments(docs);
      } catch (error) {
        if (!signal?.aborted)
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load documents.",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [pet.id],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void Promise.resolve().then(() => loadDocuments(ctrl.signal));
    return () => ctrl.abort();
  }, [loadDocuments]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, file }));
    setSelectedFileName(file?.name ?? "");
    e.target.value = "";
  }

  function handleDateChange(value: string) {
    setForm((prev) => ({ ...prev, issuedDate: value }));
    if (dateError && (value.trim() === "" || isValidIssuedDate(value)))
      setDateError(null);
  }

  function validateDate() {
    if (form.issuedDate.trim() !== "" && !isValidIssuedDate(form.issuedDate)) {
      setDateError("Use format DD.MM.YYYY");
      return false;
    }
    setDateError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormComplete || !validateDate()) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      const { fileId, mimeType } = await uploadDocumentFile(form.file!);
      const newDoc = await addPetDocument(pet.id, {
        name: form.name.trim(),
        issuedDate: formatIssuedDateForApi(form.issuedDate),
        fileId,
        mimeType,
      });
      setDocuments((prev) => [newDoc, ...prev]);
      setForm(emptyForm);
      setSelectedFileName("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not add document.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(docId: string) {
    try {
      await deletePetDocument(pet.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not delete document.",
      );
    }
  }

  const filteredDocuments = search.trim()
    ? documents.filter((d) =>
        d.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : documents;

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 md:col-span-2 md:row-start-2"
    >
      <div
        className={cn(
          "flex flex-col gap-6 pt-8",
          "md:grid md:grid-cols-[180px_minmax(0,300px)_minmax(0,300px)]",
          "md:gap-x-6 md:gap-y-6 md:pt-0",
          "xl:grid-cols-[176px_minmax(0,300px)_minmax(0,300px)] xl:gap-x-[50px]",
        )}
      >
        <button
          type="button"
          onClick={onAvatarClick}
          title="Change pet avatar"
          className={cn(
            "mx-auto flex h-[292px] w-[176px] items-center justify-center overflow-hidden rounded-[14px] border bg-white transition",
            "hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
            "md:col-start-1 md:row-start-1 md:row-end-3 md:mx-0 md:mt-6 md:h-[260px] md:w-[180px] md:border-[4px]",
            "xl:mt-8 xl:h-[292px] xl:w-[176px] xl:border",
          )}
          style={{ borderColor }}
        >
          {avatarPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreviewUrl}
              alt={`${pet.name} avatar preview`}
              className="h-full w-full object-cover object-center"
            />
          ) : pet.imageFileId ? (
            <PrivateImage
              fileId={pet.imageFileId}
              alt={pet.description ?? `${pet.name} pet profile photo`}
              className="h-full w-full object-cover object-center"
            />
          ) : pet.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.imageUrl}
              alt={pet.description ?? `${pet.name} pet profile photo`}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f0ebe4]">
              <PawPrint
                className="h-1/2 w-1/2 text-[#c9b99a]"
                aria-hidden="true"
              />
            </div>
          )}
        </button>

        <button
          type="button"
          disabled={uploadingAvatar}
          onClick={onAvatarClick}
          className={cn(
            "mx-auto inline-flex min-h-[60px] w-[176px] items-center justify-center gap-2 rounded-[14px]",
            "bg-[#ff8a24] px-5 text-[1.05rem] font-medium text-white transition",
            "hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-70",
            "md:col-start-1 md:row-start-3 md:mx-0 md:w-[180px]",
            "xl:w-[176px]",
          )}
        >
          {uploadingAvatar ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Uploading
            </>
          ) : (
            <>
              <Camera className="h-6 w-6" aria-hidden="true" />
              {pet.imageFileId || pet.imageUrl ? "Change Avatar" : "Pet Avatar"}
            </>
          )}
        </button>

        <div
          className={cn(
            "flex flex-col gap-6",
            "md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-3 md:mt-6 md:self-start",
            "xl:mt-8",
          )}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DocumentFormField
              id="doc-name"
              label="document name"
              value={form.name}
              onChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
            />
            <DocumentFormField
              id="doc-issued"
              label="document issued"
              value={form.issuedDate}
              inputMode="numeric"
              error={dateError}
              onChange={handleDateChange}
              onBlur={validateDate}
            />
          </div>

          <div className="space-y-3">
            <span className="block text-[0.98rem] leading-none font-medium text-[#1a202c]">
              choose file
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-full items-center justify-between rounded-[14px] border border-[#1a202c] bg-white px-4 text-left transition outline-none hover:border-[#7a7878] hover:bg-[#f9f9f9] focus-visible:ring-2 focus-visible:ring-[#1a202c]/15"
            >
              <span className="min-w-0 truncate text-[1rem] text-[#1a202c]/50">
                {selectedFileName}
              </span>
              <Download
                aria-hidden="true"
                className="ml-3 h-5 w-5 shrink-0 text-[#1a202c]"
                strokeWidth={1.8}
              />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-2 md:col-start-2 md:col-end-4 md:row-start-3">
          {submitError ? (
            <p className="text-sm font-medium text-[#b91c1c]">{submitError}</p>
          ) : null}
          <button
            type="submit"
            disabled={!isFormComplete || submitting}
            className={cn(
              "font-display inline-flex h-[60px] w-full items-center justify-center gap-2 rounded-[14px]",
              "text-xl leading-6 font-semibold transition",
              "focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none",
              "md:max-w-[320px]",
              isFormComplete
                ? "border border-[#1a202c] bg-[#97ff7b] text-[#1a202c] hover:bg-[#6bb556] disabled:opacity-70"
                : "cursor-not-allowed border-transparent bg-[#7a7878]/50 text-white",
            )}
          >
            {submitting ? (
              <Spinner label="Adding..." />
            ) : (
              <>
                <Plus
                  className="h-5 w-5"
                  aria-hidden="true"
                  strokeWidth={2.5}
                />
                Add Document
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex w-full items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-white px-3 py-2 sm:px-4">
          <input
            type="search"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[0.98rem] text-[#1a202c] outline-none placeholder:text-[#a0aec0]"
          />
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            className={cn(
              "shrink-0 rounded-[8px] p-1.5 transition focus-visible:outline-none",
              viewMode === "grid"
                ? "bg-[#f0ebe4] text-[#1a202c]"
                : "text-[#a0aec0] hover:text-[#1a202c]",
            )}
          >
            <ImageIcon
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={cn(
              "shrink-0 rounded-[8px] p-1.5 transition focus-visible:outline-none",
              viewMode === "list"
                ? "bg-[#f0ebe4] text-[#1a202c]"
                : "text-[#a0aec0] hover:text-[#1a202c]",
            )}
          >
            <List
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading documents..." />
          </div>
        ) : loadError ? (
          <p className="py-4 text-center text-sm font-medium text-[#b91c1c]">
            {loadError}
          </p>
        ) : filteredDocuments.length === 0 ? (
          <p className="py-4 text-center text-sm font-medium text-[#1a202c]/50">
            {search.trim() ? "No documents found." : "No documents yet."}
          </p>
        ) : viewMode === "grid" ? (
          <DocumentsGallery
            documents={filteredDocuments}
            onDelete={handleDelete}
          />
        ) : (
          <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-4">
            {filteredDocuments.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
