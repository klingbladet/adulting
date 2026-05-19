import CreatorStepper from "@/components/courses/creator-stepper"
import Link from "next/link"
import CourseButton from "@/components/courses/course-buttons"

export default function PreviewPage() {

  return(
    <>
      <CreatorStepper currentStep={4} />
      <div className="flex flex-row justify-between">
          <Link href={`/create/creator-tools/create-content`}>
            <CourseButton variant="secondary">Tillbaka</CourseButton>
          </Link>
          <Link href={`/create/creator-tools/publish`}>
            <CourseButton>Nästa</CourseButton>
          </Link>
      </div>
    </>
  )
}


