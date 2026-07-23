import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import {
  MAX_MODE_MINUTES,
  MAX_SESSION_MODES,
  MIN_MODE_MINUTES,
  MIN_SESSION_MODES,
  type SessionMode,
  createSessionMode,
  loadSessionModes,
  minutesToMs,
  msToMinutes,
  saveSessionModes,
} from '../lib/sessionModes';

type Props = {
  durationMs: number;
  disabled?: boolean;
  onChange: (ms: number) => void;
};

type DraftRow = { id: string; label: string; minutes: string };

export function DurationPicker({ durationMs, disabled, onChange }: Props) {
  const [modes, setModes] = useState<SessionMode[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftRow[]>([]);
  const [saving, setSaving] = useState(false);

  const hydrate = useCallback(async () => {
    setModes(await loadSessionModes());
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const openEditor = () => {
    if (disabled) return;
    setDraft(
      modes.map((m) => ({
        id: m.id,
        label: m.label,
        minutes: String(msToMinutes(m.durationMs)),
      })),
    );
    setEditing(true);
  };

  const addMode = () => {
    if (draft.length >= MAX_SESSION_MODES) return;
    const created = createSessionMode('New session', 25);
    setDraft((prev) => [
      ...prev,
      {
        id: created.id,
        label: created.label,
        minutes: String(msToMinutes(created.durationMs)),
      },
    ]);
  };

  const removeMode = (id: string) => {
    if (draft.length <= MIN_SESSION_MODES) return;
    setDraft((prev) => prev.filter((row) => row.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      const next = await saveSessionModes(
        draft.map((row) => ({
          id: row.id,
          label: row.label,
          durationMs: minutesToMs(Number.parseInt(row.minutes, 10)),
        })),
      );
      setModes(next);
      setEditing(false);
      if (!next.some((m) => m.durationMs === durationMs) && next[0]) {
        onChange(next[0].durationMs);
      }
    } finally {
      setSaving(false);
    }
  };

  const canDelete = draft.length > MIN_SESSION_MODES;
  const canAdd = draft.length < MAX_SESSION_MODES;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Session</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit session modes"
          disabled={disabled}
          onPress={openEditor}
          hitSlop={8}
          style={({ pressed }) => [
            disabled && styles.editDisabled,
            pressed && !disabled && styles.pressed,
          ]}
        >
          <Text style={styles.edit}>Edit Modes</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        {modes.map((mode) => {
          const active = mode.durationMs === durationMs;
          return (
            <Pressable
              key={mode.id}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled }}
              onPress={() => onChange(mode.durationMs)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                disabled && styles.chipDisabled,
                pressed && !disabled && styles.pressed,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={editing}
        animationType="slide"
        transparent
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Modes</Text>
            <Text style={styles.modalHint}>
              Add, remove, rename, and set minutes ({MIN_MODE_MINUTES}–
              {MAX_MODE_MINUTES}).
            </Text>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {draft.map((row, index) => (
                <View key={row.id} style={styles.draftRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${row.label || 'mode'}`}
                    disabled={!canDelete}
                    onPress={() => removeMode(row.id)}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      !canDelete && styles.iconDisabled,
                      pressed && canDelete && styles.pressed,
                    ]}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color={canDelete ? colors.error : colors.outline}
                    />
                  </Pressable>
                  <TextInput
                    accessibilityLabel={`${row.id} name`}
                    value={row.label}
                    onChangeText={(label) => {
                      setDraft((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, label } : r)),
                      );
                    }}
                    style={styles.nameInput}
                    maxLength={24}
                    placeholder="Name"
                    placeholderTextColor={colors.outline}
                  />
                  <TextInput
                    accessibilityLabel={`${row.id} minutes`}
                    value={row.minutes}
                    onChangeText={(minutes) => {
                      setDraft((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, minutes: minutes.replace(/[^\d]/g, '') }
                            : r,
                        ),
                      );
                    }}
                    keyboardType="number-pad"
                    style={styles.minutesInput}
                    maxLength={3}
                    placeholder="min"
                    placeholderTextColor={colors.outline}
                  />
                  <Text style={styles.minSuffix}>min</Text>
                </View>
              ))}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add session mode"
                disabled={!canAdd}
                onPress={addMode}
                style={({ pressed }) => [
                  styles.addBtn,
                  !canAdd && styles.iconDisabled,
                  pressed && canAdd && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={22}
                  color={canAdd ? colors.secondary : colors.outline}
                />
                <Text style={[styles.addLabel, !canAdd && styles.addLabelDisabled]}>
                  {canAdd
                    ? 'Add session'
                    : `Max ${MAX_SESSION_MODES} sessions`}
                </Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditing(false)}
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving || draft.length < MIN_SESSION_MODES}
                onPress={() => void save()}
                style={({ pressed }) => [
                  styles.saveBtn,
                  (saving || draft.length < MIN_SESSION_MODES) && styles.saveDisabled,
                  pressed && !saving && styles.pressed,
                ]}
              >
                <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    ...typography.label,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  edit: {
    ...typography.micro,
    fontSize: 12,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
  editDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.outlineSoft,
  },
  chipActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.tertiaryContainer,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipLabel: {
    ...typography.label,
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  chipLabelActive: {
    color: colors.onTertiaryContainer,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 24, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: '85%',
  },
  modalTitle: {
    ...typography.headline,
    color: colors.secondary,
  },
  modalHint: {
    ...typography.body,
    color: colors.inkMuted,
  },
  modalScroll: {
    maxHeight: 360,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDisabled: {
    opacity: 0.4,
  },
  nameInput: {
    flex: 1,
    ...typography.label,
    color: colors.ink,
    borderWidth: 2,
    borderColor: colors.outlineSoft,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceContainer,
  },
  minutesInput: {
    width: 56,
    textAlign: 'center',
    ...typography.label,
    color: colors.ink,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radii.md,
    paddingVertical: 10,
    backgroundColor: colors.surfaceContainer,
  },
  minSuffix: {
    ...typography.micro,
    color: colors.inkMuted,
    width: 28,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainer,
  },
  addLabel: {
    ...typography.label,
    color: colors.secondary,
  },
  addLabelDisabled: {
    color: colors.outline,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
  },
  cancelLabel: {
    ...typography.label,
    color: colors.secondary,
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.primaryContainer,
    boxShadow: `3px 3px 0px 0px ${colors.secondary}`,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
  },
});
