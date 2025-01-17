
import { IconBadge } from "@/components/icon-badge"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { AlertCircle, File, IndianRupee, LayoutDashboard, ListChecks } from "lucide-react"
import { redirect } from "next/navigation"
import { type } from "os"
import TitleForm from "./_component/title_form"
import DescriptionForm from "./_component/description_form"
import ImageForm from "./_component/image-form"
import CategoryForm from "./_component/category_form"
import PriceForm from "./_component/price_form"
import AttachmentForm from "./_component/attachment-form"
import ChapterForm from "./_component/chapters_form"
import { CourseAction } from "./_component/course-action"
import { useEffect, useState } from "react"

type course_page_params={
    params:{
        courseId:string
    }
}

const Coursepage = async({params}:course_page_params) => {
  // console.log(params)
  const {userId}=auth();
    
  if(!userId)
  {
    return redirect('/')
  }

 const course=await db.course.findUnique({
    where :{
      id:params.courseId,
      userId
    },

    include:{

      chapters:{
        orderBy:{position:'asc'}
      },

      attachments:{
        orderBy:{createdAt:'desc'}
      }
    },
 })

 

 const categories=await db.category.findMany({
  orderBy:{
   name:'asc'
  }
})

 

 if(!course)
 {
  return redirect('/')
 }



const requiredFields=[course.title,course.description,course.imageUrl,course.price,course.categoryId,course.chapters.some((chapter)=>chapter.isPublished)];
const totalFields=requiredFields.length;
const completedField=requiredFields.filter(Boolean).length

const isComplete=requiredFields.every(Boolean);


const completionText=`(${completedField} / ${totalFields})`


  return (
    <>
      {
      !course.isPublished && (
      <h2 className=" bg-yellow-200 h-12 flex items-center gap-x-1 text-slate-800">
          <AlertCircle className='ml-3' />
        <div>This course  is not published.It will not be visible to the students</div>
        </h2>
      )
    }
    <div className="p-6">
         <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">
                            Course Setup
                        </h1>

                        <span className="text-sm text-slate-700">
                          Complete all fields {completionText}
                        </span>
                </div>
                <CourseAction
                disabled={!isComplete}
                courseId={params.courseId}
                isPublished={course.isPublished}
                />

         </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
               <div>
                        <div className="flex items-center gap-x-2">
                          <IconBadge icon={LayoutDashboard}  variant='default'/>
                              <h2 className=" text-xl">
                                Customize your course
                              </h2>
                        </div>
                        <TitleForm initialData={course}  courseId={course.id}/>
                        <DescriptionForm initialData={course}  courseId={course.id}/>
                        <ImageForm initialData={course}  courseId={course.id}/>
                        <CategoryForm initialData={course}  courseId={course.id} options={categories.map((category)=>({
                          label:category.name,
                          value:category.id }))} />
                        
               </div>
                <div className=" space-y-6">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={ListChecks} />
                             <h2 className="text-xl">
                               Course Chapters
                             </h2>
                        </div>

                        <ChapterForm
                           initialData={course}
                           courseId={course.id}
                            />
                    </div>
 
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={IndianRupee} />
                             <h2 className="text-xl">
                               Sell your Course
                             </h2>
                        </div>
                       <PriceForm initialData={course}  courseId={course.id} />
                    </div>
                     
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={File} />
                             <h2 className="text-xl">
                              Resources & Attachments
                             </h2>
                        </div>

                        <AttachmentForm 
                        initialData={course}
                         courseId={course.id}
                         />
                        
                    </div>


                </div>
           </div>

      </div>
      </>
  )
}

export default Coursepage