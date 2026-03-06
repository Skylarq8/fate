import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Car, Package, RotateCcw, Van } from "lucide-react";

const items = [
  {
    id: 1,
    icon: Van,
    trigger: "Захиалга хэр удаж ирэх вэ?",
    content: "Таны захиалга 5-10 хоног ирнэ. Барааны онцлогоос хамааран захиалга ирэх хугацаа өөрчлөгдөж болохыг анхаарна уу. "
  },
  {
    id: 2,
    icon: Package,
    trigger: "Хүргэлт үнэтэй юу?",
    content: "Бүх захиалгын хүргэлт үнэгүй."
  },
  {
    id: 3,
    icon: Car,
    trigger: "Хөдөө орон нутагт хүргэх үү?",
    content: "Таны захиалга ирмэгч бид хөдөө орон нутгын унаанд үнэгүй тавьж өгнө."
  }, 
  {
    id: 4,
    icon: RotateCcw,
    trigger: "Буцаалт байгаа юу?",
    content: "Захиалга баталгаажиж бараа ирж байгаа тохиолдолд буцаан олголт байхгүй."
  }
]

export default function Accordin() {
  return (
    <Accordion type='multiple' className="w-full max-w-3xl" defaultValue={["notifications"]}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
            <AccordionItem key={item.id} value={item.id.toString()}>
              <AccordionTrigger>
                <div className="w-full flex justify-start items-center gap-2 text-[16px]">
                  <Icon className="size-4 lg:size-5" />
                  {item.trigger}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[14px] lg:text-[16px]">{item.content}</AccordionContent>
            </AccordionItem>
          )
          })}
    </Accordion>
  )
}