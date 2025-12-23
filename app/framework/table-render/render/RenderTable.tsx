'use client';

import React from 'react';
import LineList from './line-list';
import type { DataItem, RenderTableProps } from './types';

export function RenderTable<T extends DataItem>(props: RenderTableProps<T>) {
  return <LineList {...props} />;
}
