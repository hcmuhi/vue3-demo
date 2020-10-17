import { defineComponent, ref, reactive, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { NavBar } from "vant";
import { questionList, answerList, mapList } from "./map-list"
import "@/assets/css/chat.styl"
import { easeout } from '@/utils/dom';
import { MsgList } from "./chat"
import { useHeight } from '@/composition/use-rect';

export default defineComponent(() => {
  const router = useRouter()
  const answerRef = ref();
  const msgList: Array<MsgList> = reactive([])

  let chatBottomHeight = useHeight(answerRef);

  let timer = 0
  let ansList: Array<string> = reactive([])
  let answers = mapList.Q1

  window.scroll2Bottom = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const dom = scrollTop === document.documentElement.scrollTop ? document.documentElement : document.body;
    easeout(dom, dom.offsetHeight - dom.clientHeight, 10)
  }

  const onClickLeft = () => {
    router.back()
  }

  const scrollPageBottom = async () => {
    await nextTick()
    chatBottomHeight = useHeight(answerRef);
    console.log(chatBottomHeight.value);
    window.scroll2Bottom()
  }

  const chatFinish = () => {
    console.log('聊天结束');
  }

  const setMsg = (message: string, direction: 'left' | 'right') => {
    msgList.push({
      message: message,
      direction: direction
    })
  }

  const setQuestion = (question: string) => {
    setMsg(questionList[question], 'left')
    answers = mapList[question]
    if (!answers) return chatFinish()
    if (typeof answers === 'string') {
      timer = setTimeout(() => {
        setQuestion(answers as string)
        scrollPageBottom()
      }, (Math.random() * 5) * 100);
    } else {
      ansList = Object.keys(answers)
    }
  }

  const addAnswer = (item: string) => {
    setMsg(answerList[item], 'right')
    ansList = []
    timer = setTimeout(() => {
      setQuestion(typeof answers === 'string' ? answers : answers[item])
      scrollPageBottom()
    }, (Math.random() * 5 + 5) * 100);
  }

  const messageDom = () => msgList.length > 0 && (
    <div class="chat-wrapper" style={{ marginBottom: chatBottomHeight.value + 50 + 'px' }}>
      {msgList.map(item => (
        <li class={['flex pd10 align-start', item.direction === 'left' ? 'justify-start' : 'justify-end']}>
          {item.direction === 'left' ? <div class="avatar"></div> : null}
          <div class={['mg-l10 bubble', item.direction === 'left' ? 'bubble-left' : 'bubble-right']} >
            <p class="bgfff lh20 fs12" v-html={item.message}></p>
          </div>
          {item.direction === 'right' ? <div class="avatar"></div> : null}
        </li>
      ))}
    </div>
  )

  const answerDom = () => ansList.length > 0 && (
    <div class="answers-wrapper flex flex-wrap max640" ref={answerRef}>
      {ansList.map((item: string) => (
        <div class="btnbox col-6 flex">
          <div class="flex flex-center btn" onClick={() => addAnswer(item)}>{answerList[item]}</div>
        </div>
      ))}
    </div>
  )

  onMounted(() => {
    setQuestion('Q1')
  })
  onUnmounted(() => {
    clearTimeout(timer)
  })

  return () => (
    <div class="pd-nav">
      <NavBar fixed title="聊天室" left-arrow onClick-left={onClickLeft} />
      {messageDom()}
      {answerDom()}
    </div>
  )
})