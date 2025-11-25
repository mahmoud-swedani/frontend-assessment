'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  placeholder: string;
  allRolesLabel: string;
  id?: string;
}

export function RoleSelect({
  value,
  onValueChange,
  className,
  ariaLabel,
  placeholder,
  allRolesLabel,
  id,
}: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allRolesLabel}</SelectItem>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="Agent">Agent</SelectItem>
        <SelectItem value="Creator">Creator</SelectItem>
      </SelectContent>
    </Select>
  );
}

