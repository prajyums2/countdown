"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import type { Station, Milestone, JourneyConfig, StationEventType } from "@/lib/types";
import { uploadImage } from "@/lib/upload";
import {
  addStation,
  updateStation,
  deleteStation,
  reorderStations,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  updateConfig,
} from "@/lib/api";

type Tab = "stations" | "milestones" | "config";

const pin = process.env.NEXT_PUBLIC_ADMIN_PIN || "2026";

const eventTypes: StationEventType[] = [
  "normal",
  "hug",
  "date-night",
  "birthday",
  "cozy",
  "surprise",
  "departure",
];

function ImageUploader({
  currentUrl,
  onUpload,
}: {
  currentUrl: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <RefreshCw size={12} className="animate-spin" />
        ) : (
          <Upload size={12} />
        )}
        {uploading ? "Uploading..." : currentUrl ? "Change" : "Upload"}
      </button>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-rose-400 underline truncate max-w-[120px]"
        >
          View
        </a>
      )}
    </div>
  );
}

function StationForm({
  station,
  onSave,
  onCancel,
}: {
  station?: Station;
  onSave: (data: Partial<Station>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(station?.name || "");
  const [emoji, setEmoji] = useState(station?.emoji || "📍");
  const [dateTime, setDateTime] = useState(station?.dateTime?.slice(0, 16) || "");
  const [description, setDescription] = useState(station?.description || "");
  const [imageUrl, setImageUrl] = useState(station?.imageUrl || "");
  const [eventType, setEventType] = useState<StationEventType>(
    station?.eventType || "normal"
  );
  const [customMessage, setCustomMessage] = useState(station?.customMessage || "");
  const [spotifyUrl, setSpotifyUrl] = useState(station?.spotifyUrl || "");

  return (
    <div className="space-y-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Station name"
          className="col-span-2 px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        />
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="Emoji"
          className="px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        />
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300 resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as StationEventType)}
          className="px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        >
          {eventTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <ImageUploader currentUrl={imageUrl} onUpload={setImageUrl} />
      </div>
      <textarea
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        placeholder="Custom message (love letter, promise, etc.)"
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300 resize-none"
      />
      <input
        value={spotifyUrl}
        onChange={(e) => setSpotifyUrl(e.target.value)}
        placeholder="Spotify embed URL (optional)"
        className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({ name, emoji, dateTime, description, imageUrl, eventType, customMessage, spotifyUrl })
          }
          className="px-4 py-1.5 text-xs rounded-lg bg-rose-400 text-white hover:bg-rose-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function MilestoneForm({
  milestone,
  onSave,
  onCancel,
}: {
  milestone?: Milestone;
  onSave: (data: Partial<Milestone>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(milestone?.title || "");
  const [date, setDate] = useState(milestone?.date?.slice(0, 10) || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [icon, setIcon] = useState<"salary" | "shopping">(
    milestone?.icon || "salary"
  );
  const [imageUrl, setImageUrl] = useState(milestone?.imageUrl || "");

  return (
    <div className="space-y-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="col-span-2 px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        />
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value as "salary" | "shopping")}
          className="px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
        >
          <option value="salary">Salary</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300 resize-none"
      />
      <ImageUploader currentUrl={imageUrl} onUpload={setImageUrl} />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ title, date, description, icon, imageUrl })}
          className="px-4 py-1.5 text-xs rounded-lg bg-rose-400 text-white hover:bg-rose-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel({
  stations,
  milestones,
  config,
  onRefresh,
  onClose,
}: {
  stations: Station[];
  milestones: Milestone[];
  config: JourneyConfig;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("stations");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Station | Milestone | null>(null);
  const [saving, setSaving] = useState(false);

  const [startLocation, setStartLocation] = useState(config.startLocation);
  const [endLocation, setEndLocation] = useState(config.endLocation);
  const [boardingDate, setBoardingDate] = useState(
    config.trainBoardingDate?.slice(0, 16) || ""
  );
  const [arrivalDate, setArrivalDate] = useState(
    config.arrivalDate?.slice(0, 16) || ""
  );

  const handleSaveStation = async (data: Partial<Station>) => {
    setSaving(true);
    try {
      if (editing) {
        await updateStation({ ...(editing as Station), ...data }, pin);
      } else {
        await addStation(
          { ...data, id: "", orderIndex: stations.length + 1 } as Station,
          pin
        );
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (e) {
      alert("Failed to save station");
    }
    setSaving(false);
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm("Delete this station?")) return;
    try {
      await deleteStation(id, pin);
      onRefresh();
    } catch {
      alert("Failed to delete");
    }
  };

  const handleSaveMilestone = async (data: Partial<Milestone>) => {
    setSaving(true);
    try {
      if (editing) {
        await updateMilestone({ ...(editing as Milestone), ...data }, pin);
      } else {
        await addMilestone({ ...data, id: "" } as Milestone, pin);
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch {
      alert("Failed to save milestone");
    }
    setSaving(false);
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await deleteMilestone(id, pin);
      onRefresh();
    } catch {
      alert("Failed to delete");
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateConfig(
        {
          startLocation,
          endLocation,
          trainBoardingDate: boardingDate + ":00",
          arrivalDate: arrivalDate + ":00",
        },
        pin
      );
      onRefresh();
    } catch {
      alert("Failed to update config");
    }
    setSaving(false);
  };

  const sortedStations = [...stations].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/10"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md bg-white shadow-2xl shadow-rose-900/10 h-full overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-rose-50 z-10 p-4 flex items-center justify-between">
          <h2 className="font-nunito font-semibold text-slate-700">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-rose-50">
          {(["stations", "milestones", "config"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setShowForm(false);
                setEditing(null);
              }}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t
                  ? "text-rose-500 border-b-2 border-rose-400"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "stations" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {sortedStations.length} stations
                </p>
                <button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(!showForm);
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-400 text-white hover:bg-rose-500"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {showForm && (
                <StationForm
                  station={editing as Station}
                  onSave={handleSaveStation}
                  onCancel={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                />
              )}

              <div className="space-y-2">
                {sortedStations.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-3 bg-rose-50/30 rounded-xl border border-rose-50"
                  >
                    <span className="text-xs text-slate-300 w-4">{i + 1}</span>
                    <span className="text-lg">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {s.name}
                      </p>
                      <p className="text-[0.6rem] text-slate-400 font-caveat">
                        {s.dateTime?.slice(0, 10)} — {s.eventType}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditing(s);
                        setShowForm(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-500"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteStation(s.id)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "milestones" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {milestones.length} milestones
                </p>
                <button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(!showForm);
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-400 text-white hover:bg-rose-500"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {showForm && (
                <MilestoneForm
                  milestone={editing as Milestone}
                  onSave={handleSaveMilestone}
                  onCancel={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                />
              )}

              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-3 bg-rose-50/30 rounded-xl border border-rose-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {m.title}
                      </p>
                      <p className="text-[0.6rem] text-slate-400 font-caveat">
                        {m.date}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditing(m);
                        setShowForm(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-500"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "config" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.6rem] uppercase tracking-wider text-slate-400 font-semibold">
                      Start Location
                    </label>
                    <input
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6rem] uppercase tracking-wider text-slate-400 font-semibold">
                      End Location
                    </label>
                    <input
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[0.6rem] uppercase tracking-wider text-slate-400 font-semibold">
                      Boarding Date
                    </label>
                    <input
                      type="datetime-local"
                      value={boardingDate}
                      onChange={(e) => setBoardingDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6rem] uppercase tracking-wider text-slate-400 font-semibold">
                      Arrival Date
                    </label>
                    <input
                      type="datetime-local"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-rose-100 bg-white outline-none focus:border-rose-300"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-rose-400 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Config
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
