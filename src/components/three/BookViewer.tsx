"use client";
import dynamic from "next/dynamic";
import { ViewerSkeleton } from "./TeeViewer";

const BookStage = dynamic(() => import("./BookStage"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

export default BookStage;
