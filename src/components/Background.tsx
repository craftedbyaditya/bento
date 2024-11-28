import React from 'react';

export const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative overflow-hidden bg-slate-50">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    <div className="absolute right-0 w-[120%] aspect-square bg-gradient-to-tr from-sky-100 to-indigo-100 rounded-[50%] -top-1/2 blur-3xl opacity-30" />
    <div className="absolute -left-1/4 w-[120%] aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-[50%] -bottom-1/2 blur-3xl opacity-30" />
    {children}
  </div>
);