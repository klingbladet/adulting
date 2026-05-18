import CreatorStepper from "@/components/courses/creator-stepper"
import CourseButton from "@/components/courses/course-buttons"
import Link from "next/link"


export default function SummaryPage() {

  return(
    <>
      <CreatorStepper currentStep={5} />
      <Link href={`/create/creator-tools/create-content`}>
            <CourseButton variant="secondary">Publicera</CourseButton>
      </Link>
      
    </>
  )
}


