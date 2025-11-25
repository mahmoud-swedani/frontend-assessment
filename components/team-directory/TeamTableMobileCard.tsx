'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import type { TeamMember } from '@/types/teamDirectory';
import { ROLE_COLORS } from '@/lib/constants';
import { staggerItem, SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface TeamTableMobileCardProps {
  member: TeamMember;
  index?: number;
}

export function TeamTableMobileCard({ member, index = 0 }: TeamTableMobileCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerItem}
      transition={{ delay: index * 0.03 }}
      className="p-4 border-2 border-primary/10 rounded-xl bg-card shadow-soft hover:shadow-medium hover:border-primary/20 transition-all"
      role="row"
      aria-label={`Team member ${member.name}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {member.avatar ? (
            <Image
              src={member.avatar}
              alt={`${member.name}'s avatar`}
              width={40}
              height={40}
              className="rounded-full"
              unoptimized={member.avatar.includes('dicebear.com')}
              loading={index < 5 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-rose-lavender/10 flex items-center justify-center text-sm font-semibold text-primary shadow-soft">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {member.name}
            </h3>
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-soft flex-shrink-0',
                ROLE_COLORS[member.role]
              )}
            >
              {member.role}
            </span>
          </div>
          
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            aria-label={`Email ${member.name} at ${member.email}`}
          >
            <Mail className="h-3 w-3" aria-hidden="true" />
            <span className="truncate">{member.email}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

