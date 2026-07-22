const pool = require('../config/db');

const aiReplies = [
  { keywords: ['你好', 'hello', 'hi', '嗨', '您好'], responses: [
    '你好！我是小白网站的智能助手，有什么可以帮你的吗？😊',
    '嗨！很高兴见到你，请问有什么需要帮助的？',
    '你好呀！我可以帮你解答问题，聊聊天也行哦！'
  ]},
  { keywords: ['天气', '温度', '下雨', '晴天', '预报'], responses: [
    '今天天气看起来不错哦！建议出门前查看当地天气预报。☀️',
    '我暂时无法获取实时天气信息，但你可以查看手机上的天气应用哦！',
    '天气变化多端，记得随时关注天气预报，注意保暖或防晒！'
  ]},
  { keywords: ['时间', '几点', '现在', '日期'], responses: [
    `现在是 ${new Date().toLocaleString('zh-CN')}`,
    '当前时间是 ' + new Date().toLocaleTimeString('zh-CN'),
    '今天是 ' + new Date().toLocaleDateString('zh-CN')
  ]},
  { keywords: ['帮助', '功能', '能做', '可以'], responses: [
    '我是AI智能助手，可以帮你解答问题、聊天、提供建议。目前支持公屏聊天、好友私信等功能！',
    '小白网站支持：公屏聊天室、好友系统、私信聊天、个人设置等功能。',
    '有什么问题尽管问我，我会尽力帮助你！'
  ]},
  { keywords: ['聊天', '聊', '说话'], responses: [
    '好的！我们来聊聊天吧，你想说什么？',
    '聊天是我的强项，来吧！',
    '我随时准备好聊天，你有什么有趣的事情分享吗？'
  ]},
  { keywords: ['再见', '拜拜', '走了', '88'], responses: [
    '再见！期待下次和你聊天！👋',
    '拜拜！祝你有美好的一天！',
    '再见啦！有空再来找我玩！'
  ]},
  { keywords: ['谢谢', '感谢', 'thank you'], responses: [
    '不客气！能帮到你我很开心！😊',
    '不用谢！有问题随时来找我！',
    '感谢你的使用，祝你愉快！'
  ]},
  { keywords: ['名字', '叫什么'], responses: [
    '我叫小白助手，是小白网站的AI助手！',
    '你可以叫我小白助手哦！',
    '我的名字是小白助手，很高兴认识你！'
  ]},
  { keywords: ['无聊', '没事', '好无聊'], responses: [
    '无聊吗？我们可以聊聊天，或者你可以去聊天室看看其他人在聊什么！',
    '来聊天吧！说说你今天发生了什么有趣的事情？',
    '不如我们玩个小游戏？或者我给你讲个笑话？'
  ]},
  { keywords: ['笑话', '搞笑', '开心'], responses: [
    '为什么程序员喜欢用黑暗模式？因为他们不想让代码看到他们哭！😂',
    '有一天，0遇到了8，0说："胖就胖嘛，还系什么腰带！"',
    '程序员的女朋友问他："你是不是不爱我了？"程序员回答："没有啊，我只是在debug..."'
  ]},
  { keywords: ['学习', '作业', '考试'], responses: [
    '学习要劳逸结合哦！加油！你一定可以的！💪',
    '考试顺利！相信自己的努力会有回报的！',
    '如果遇到难题，可以先休息一下，换个思路说不定会有新发现！'
  ]},
  { keywords: ['工作', '上班', '加班'], responses: [
    '工作辛苦了！记得照顾好自己的身体！',
    '加班不要太晚哦，身体是革命的本钱！',
    '工作重要，休息也很重要，记得劳逸结合！'
  ]},
  { keywords: ['心情', '情绪', '难过', '开心'], responses: [
    '无论心情如何，我都在这里陪你！',
    '难过的时候可以找我倾诉，开心的时候也可以和我分享！',
    '保持好心情，一切都会好起来的！🌈'
  ]}
];

const defaultReplies = [
  '这个问题很有趣！让我想想...',
  '我理解你的意思，让我分析一下...',
  '这是一个很好的问题！我来帮你解答。',
  '感谢你的提问，我会尽力回答！',
  '让我整理一下思路，然后给你一个详细的回答...',
  '这个话题很有意思，我们可以深入探讨一下！',
  '我正在思考这个问题，请稍等...',
  '好的，我来为你解答这个问题！',
  '我会根据我的知识库来回答你的问题。',
  '这是一个值得思考的问题，让我分享一下我的看法。'
];

class AIModel {
  async generateReply(userMessage, userId) {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const rule of aiReplies) {
      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          const randomIndex = Math.floor(Math.random() * rule.responses.length);
          return rule.responses[randomIndex];
        }
      }
    }
    
    const randomIndex = Math.floor(Math.random() * defaultReplies.length);
    return defaultReplies[randomIndex];
  }

  async generateReplyWithLLM(userMessage, userId) {
    const llmApiKey = process.env.LLM_API_KEY;
    const llmApiUrl = process.env.LLM_API_URL;

    if (!llmApiKey || !llmApiUrl) {
      return this.generateReply(userMessage, userId);
    }

    try {
      const response = await fetch(llmApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmApiKey}`
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一个友好的AI助手，名字叫小白助手。你在小白网站上为用户提供帮助。请用中文回复，语气友好亲切。' },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('LLM API request failed');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.generateReply(userMessage, userId);
    } catch (error) {
      console.error('[AI] LLM API error:', error.message);
      return this.generateReply(userMessage, userId);
    }
  }

  async saveChatHistory(userId, userMessage, aiReply) {
    try {
      let [conversations] = await pool.query(
        'SELECT id FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );

      let conversationId;
      if (conversations.length === 0) {
        const [convResult] = await pool.query(
          'INSERT INTO ai_conversations (user_id, title) VALUES (?, ?)',
          [userId, '新对话']
        );
        conversationId = convResult.insertId;
      } else {
        conversationId = conversations[0].id;
        await pool.query(
          'UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?',
          [conversationId]
        );
      }

      await pool.query(
        'INSERT INTO ai_messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
        [conversationId, 'user', userMessage]
      );

      const [aiMsgResult] = await pool.query(
        'INSERT INTO ai_messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
        [conversationId, 'ai', aiReply]
      );

      return aiMsgResult.insertId;
    } catch (error) {
      console.error('[AI] Save chat history error:', error.message);
      return null;
    }
  }

  async getChatHistory(userId, limit = 50) {
    try {
      let [conversations] = await pool.query(
        'SELECT id FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );

      if (conversations.length === 0) {
        return [];
      }

      const conversationId = conversations[0].id;

      const [rows] = await pool.query(
        'SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?',
        [conversationId, limit]
      );

      return rows.reverse();
    } catch (error) {
      console.error('[AI] Get chat history error:', error.message);
      return [];
    }
  }

  async clearChatHistory(userId) {
    try {
      const [conversations] = await pool.query(
        'SELECT id FROM ai_conversations WHERE user_id = ?',
        [userId]
      );

      for (const conv of conversations) {
        await pool.query('DELETE FROM ai_messages WHERE conversation_id = ?', [conv.id]);
        await pool.query('DELETE FROM ai_conversations WHERE id = ?', [conv.id]);
      }

      return true;
    } catch (error) {
      console.error('[AI] Clear chat history error:', error.message);
      return false;
    }
  }
}

module.exports = new AIModel();