// AceleraHOF-backend/seeder.js

const mongoose = require('mongoose');
const dotenv =require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Chat = require('./src/models/Chat');
const Message = require('./src/models/Message');
const Story = require('./src/models/Story');

dotenv.config();

connectDB();

// --- DADOS DE USUÁRIOS (COM PROFISSÕES AJUSTADAS) ---
const usersData = [
    // ... (nenhuma alteração aqui, os dados de usuários estão corretos)
    {
        username: 'jacquetenorio',
        email: 'jacque.tenorio@example.com',
        password: 'password123',
        profession: 'Esteticista',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBob3RvfGVufDB8fDB8fHww',
        bio: 'Apaixonada por cuidados com a pele e bem-estar. ✨ Transformando peles e vidas.',
    },
    {
        username: 'anaclara',
        email: 'ana.clara@example.com',
        password: 'password123',
        profession: 'Maquiador(a)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZSUyMHBob3RvfGVufDB8fDB8fHww',
        bio: 'Transformando rostos com a magia da maquiagem. 💄 Realçando a beleza que já existe.',
    },
    {
        username: 'emmilly',
        email: 'emmilly@example.com',
        password: 'password123',
        profession: 'Designer de Sobrancelhas',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmlsZSUyMHBob3RvfGVufDB8fDB8fHww',
        bio: 'Sobrancelhas perfeitas para um olhar marcante. A moldura da alma.',
    },
    {
        username: 'nathaliamiotto',
        email: 'nathalia.miotto@example.com',
        password: 'password123',
        profession: 'Dermatologista',
        avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2ZpbGUlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Cuidando da saúde da sua pele com ciência e carinho. #skincarescience',
    },
    {
        username: 'henrique',
        email: 'henrique@example.com',
        password: 'password123',
        profession: 'Programador',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVufGVufDB8fDB8fHww',
        bio: 'Desenvolvedor focado em criar soluções inovadoras. Transformando café em código.',
    },
    {
        username: 'camila',
        email: 'camila@example.com',
        password: 'password123',
        profession: 'Biomédico',
        avatar: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2ZpbGUlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Pesquisa e inovação na área da saúde estética. Ciência a favor da beleza.',
    },
    {
        username: 'felipe',
        email: 'felipe@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBvcnRyYWl0fGVufDB8fDB8fHww',
        bio: 'Ajudando profissionais da estética a encontrarem seu lugar no digital. #marketingdeconteudo',
    },
    {
        username: 'annaclarabrum',
        email: 'annaclara.brum@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZSUyMHBob3RvfGVufDB8fDB8fHww',
        bio: 'Reabilitando a pele e o corpo com as melhores técnicas. Saúde e bem-estar integrados.',
    },
    {
        username: 'acelerahof',
        email: 'admin@AceleraHOF.com',
        password: 'password123',
        profession: 'Programador', // Profissão ajustada
        avatar: 'http://localhost:5000/uploads/avatars/logo.jpg',
        bio: 'Conectando os maiores talentos da estética. A casa do profissional de sucesso.',
        isAdmin: true,
    },
    {
        username: 'lucas_santos',
        email: 'lucas.santos@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8fDA%3D',
        bio: 'Capturando a essência da beleza em cada clique. A imagem como pilar do posicionamento digital.',
    },
    {
        username: 'sofia_lima',
        email: 'sofia.lima@example.com',
        password: 'password123',
        profession: 'Esteticista', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVyc29ufGVufDB8fDB8fHww',
        bio: 'A beleza começa de dentro para fora. Estética integrativa para uma pele radiante.',
    },
    {
        username: 'pedro_almeida',
        email: 'pedro.almeida@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Corpo em movimento, pele saudável. Ajudando você a atingir seus objetivos de bem-estar.',
    },
    {
        username: 'isabela_costa',
        email: 'isabela.costa@example.com',
        password: 'password123',
        profession: 'Micropigmentador(a)',
        avatar: 'https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWFufGVufDB8fDB8fHww',
        bio: 'Arte em cada fio. Especialista em lábios e sobrancelhas. #pmu',
    },
    {
        username: 'rafael_oliveira',
        email: 'rafael.oliveira@example.com',
        password: 'password123',
        profession: 'Cabeleireiro(a)', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww',
        bio: 'Estilo e precisão para o homem moderno. Mais que um corte, uma assinatura.',
    },
    {
        username: 'gabriel_souza',
        email: 'gabriel.souza@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Alinhando seu corpo, melhorando sua pele. Bem-estar que irradia de dentro para fora.',
    },
    {
        username: 'beatriz_rocha',
        email: 'beatriz.rocha@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbWFufGVufDB8fDB8fHww',
        bio: 'A imagem pessoal como ferramenta de sucesso. Vista-se de confiança e conquiste seu espaço.',
    },
    {
        username: 'tiago_pereira',
        email: 'tiago.pereira@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Criando conexões e engajamento para marcas de beleza. #socialmediamarketing',
    },
    {
        username: 'julia_gomes',
        email: 'julia.gomes@example.com',
        password: 'password123',
        profession: 'Biomédico', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdvbWFufGVufDB8fDB8fHww',
        bio: 'A ciência biomédica aplicada à estética avançada. Procedimentos para a sua melhor versão.',
    },
    {
        username: 'bruno_carvalho',
        email: 'bruno.carvalho@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fG1hbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Aliviando tensões, restaurando energias. Toque terapêutico para corpo e mente.',
    },
     {
        username: 'carolina_fernandes',
        email: 'carolina.f@example.com',
        password: 'password123',
        profession: 'Biomédico', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVudGlzdHxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Criando sorrisos e faces harmônicas. A saúde e a estética orofacial em primeiro lugar!',
    },
    {
        username: 'vanessa_melo',
        email: 'vanessa.melo@example.com',
        password: 'password123',
        profession: 'Esteticista', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5mbHVlbmNlcnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Esteticista e influencer. Compartilhando meu dia a dia e dicas de beleza com o mundo. #beautytips',
    },
    {
        username: 'rodrigo_barros',
        email: 'rodrigo.barros@example.com',
        password: 'password123',
        profession: 'Esteticista', // Profissão ajustada
        avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Esteticista e dono de uma rede de clínicas. Buscando sempre inovar no mercado da beleza.',
    },
];

// --- FUNÇÕES AUXILIARES ---
const getRandomSubset = (arr, size) => arr.sort(() => 0.5 - Math.random()).slice(0, size);
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const importData = async () => {
    try {
        console.log('🚀 Iniciando o processo de seeding...');

        // 1. Limpa o banco de dados
        console.log('🧹 Limpando coleções...');
        await Post.deleteMany();
        await User.deleteMany();
        await Chat.deleteMany();
        await Message.deleteMany();
        await Story.deleteMany();
        console.log('✅ Coleções limpas.');
        await sleep(500);

        // 2. Cria os usuários
        const createdUsers = await User.create(usersData);
        console.log(`👤 ${createdUsers.length} usuários criados.`);
        await sleep(500);

        const userMap = createdUsers.reduce((acc, user) => {
            acc[user.username] = user;
            return acc;
        }, {});

        // 3. Cria a rede de seguidores complexa
        console.log('🕸️ Criando rede de seguidores complexa...');
        const admin = userMap.acelerahof;
        const allUsersExceptAdmin = createdUsers.filter(u => u.id !== admin.id);

        for (const user of createdUsers) {
            // Admin segue todos e todos seguem o admin
            if (user.id === admin.id) {
                user.following = allUsersExceptAdmin.map(u => u._id);
            } else {
                user.followers.push(admin._id);
                // Usuários seguem um número aleatório de outros usuários
                const usersToFollow = getRandomSubset(allUsersExceptAdmin.filter(u => u.id !== user.id), Math.floor(Math.random() * 10) + 5);
                user.following.push(...usersToFollow.map(u => u._id));
                for(const followedUser of usersToFollow) {
                    const targetUser = createdUsers.find(u => u.id === followedUser.id);
                    if (targetUser && !targetUser.followers.includes(user._id)) {
                        targetUser.followers.push(user._id);
                    }
                }
            }
        }

        await Promise.all(createdUsers.map(user => user.save()));
        console.log('✅ Rede de seguidores criada.');
        await sleep(500);

        // 4. Cria posts abundantes e variados
        console.log('📝 Criando posts...');
        const postsData = [
             // Posts dos usuários originais
            { user: userMap.jacquetenorio._id, caption: 'Dia de spa em casa! Máscara de argila verde para purificar. Quem mais ama? ✨ #skincare #autocuidado', mediaUrl: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.anaclara._id, caption: 'Resultado da make de hoje! Um esfumado clássico que nunca erra. O que acharam? 💄 #makeup #makeuptutorial', mediaUrl: 'https://images.pexels.com/photos/3762662/pexels-photo-3762662.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.nathaliamiotto._id, caption: 'Não se esqueça do protetor solar, mesmo em dias nublados! A prevenção é o melhor tratamento. #dermatologia #sunscreen', mediaUrl: 'https://images.pexels.com/photos/3762870/pexels-photo-3762870.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.emmilly._id, caption: 'Design de sobrancelhas que realça o olhar. Agende seu horário!', mediaUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=500' },
            // Novos Posts
            { user: userMap.henrique._id, caption: 'Trabalhando em uma nova feature para o app. Alguma sugestão do que vocês gostariam de ver por aqui? 👨‍💻 #devlife #feedback', mediaUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.felipe._id, caption: '3 dicas de ouro para profissionais da beleza se destacarem no Instagram. A primeira é: constância! Quer saber as outras? #marketingdigital', mediaUrl: 'https://images.pexels.com/photos/6476587/pexels-photo-6476587.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.lucas_santos._id, caption: 'A foto de perfil é seu cartão de visitas. Invista em uma imagem que transmita seu profissionalismo. #fotografia #brandingpessoal', mediaUrl: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.sofia_lima._id, caption: 'Dica de hoje: suco verde para uma pele incrível! A beleza que vem de dentro reflete por fora. 🍍 #nutricao #pelesaudavel', mediaUrl: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.isabela_costa._id, caption: 'O poder da micropigmentação labial. Lábios corados e definidos por muito mais tempo. #pmu #microlabial', mediaUrl: 'https://images.pexels.com/photos/7879975/pexels-photo-7879975.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.beatriz_rocha._id, caption: 'Qual a sua mensagem? O posicionamento de marca pessoal pode transformar seu visual e carreira. #consultoriadeimagem', mediaUrl: 'https://images.pexels.com/photos/5708253/pexels-photo-5708253.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.vanessa_melo._id, caption: 'Recebidos do mês! 😍 Tantas novidades incríveis para testar com vocês. Qual produto querem ver resenha primeiro? #unboxing #beautytips', mediaUrl: 'https://images.pexels.com/photos/7262995/pexels-photo-7262995.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.rodrigo_barros._id, caption: 'Visitando nossa nova unidade. Muito orgulhoso do crescimento da nossa equipe e do padrão de qualidade que mantemos. #empreendedorismo #estetica', mediaUrl: 'https://images.pexels.com/photos/8867431/pexels-photo-8867431.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.carolina_fernandes._id, caption: 'Um rosto harmônico muda tudo! Os procedimentos com bioestimuladores de colágeno são seguros e com ótimos resultados. #biomedicinaestetica #harmonizacaofacial', mediaUrl: 'https://images.pexels.com/photos/6529841/pexels-photo-6529841.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.rafael_oliveira._id, caption: 'Antes e depois que fala, né? Corte e finalização impecáveis. Satisfação do cliente é a meta. 💈 #barbershop #hairstyle', mediaUrl: 'https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg?auto=compress&cs=tinysrgb&w=500' }
        ];

        let createdPosts = await Post.insertMany(postsData);
        console.log(`✅ ${createdPosts.length} posts criados.`);
        await sleep(500);

        // 5. Adiciona curtidas e comentários com respostas
        console.log('💬 Adicionando interações (curtidas e comentários)...');
        for (const post of createdPosts) {
            // Adiciona curtidas aleatórias
            const likers = getRandomSubset(allUsersExceptAdmin, Math.floor(Math.random() * allUsersExceptAdmin.length));
            post.likes = likers.map(u => u._id);

            // Adiciona comentários e respostas
            if (Math.random() > 0.4) { // 60% de chance de ter comentários
                 const commenters = getRandomSubset(allUsersExceptAdmin.filter(u => !u._id.equals(post.user)), Math.floor(Math.random() * 5) + 1);
                 for(const commenter of commenters) {
                     const comment = { user: commenter._id, text: `Incrível! Adorei a dica, ${getRandomElement(['show!', 'top!', 'arrasou!', 'preciso testar!'])}`, replies: [] };
                     
                     // =================== BLOCO CORRIGIDO ===================
                     if (Math.random() > 0.7) { // 30% de chance de ter uma resposta
                        // 1. Encontra o objeto do autor do post
                        const postAuthor = createdUsers.find(u => u._id.equals(post.user));
                        
                        // 2. Garante que o autor foi encontrado antes de prosseguir
                        if (postAuthor) {
                            // 3. O replicador pode ser o autor do post ou outro usuário aleatório
                            const replier = getRandomElement([postAuthor, getRandomElement(allUsersExceptAdmin)]);
                            
                            // 4. Garante que o replicador existe e não está respondendo a si mesmo
                            if (replier && !replier._id.equals(commenter._id)) {
                                comment.replies.push({ user: replier._id, text: `Obrigado! Fico feliz que gostou, @${commenter.username}.` });
                            }
                        }
                     }
                     // ======================================================

                     post.comments.push(comment);
                 }
            }
            await post.save();
        }
        
        // Adicionando um comentário mais elaborado manualmente
        const firstPost = await Post.findOne({user: userMap.jacquetenorio._id});
        if(firstPost) {
            const anaComment = { user: userMap.anaclara._id, text: 'Amei a dica! Vou fazer hoje mesmo.', replies: [] };
            anaComment.replies.push({ user: userMap.jacquetenorio._id, text: 'Faz sim, @anaclara! Sua pele vai agradecer. ❤️' });
            firstPost.comments.push(anaComment);
            firstPost.comments.push({ user: userMap.nathaliamiotto._id, text: 'Excelente rotina de cuidados! Argila verde é ótima para oleosidade.', replies: [] });
            await firstPost.save();
        }

        console.log('✅ Interações adicionadas.');
        await sleep(500);

        // 6. Cria Stories únicos
        console.log('🤳 Criando stories...');
        const storiesData = [
            { user: userMap.jacquetenorio._id, mediaUrl: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 15 },
            { user: userMap.anaclara._id, mediaUrl: 'https://images.pexels.com/photos/5938503/pexels-photo-5938503.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 },
            { user: userMap.vanessa_melo._id, mediaUrl: 'https://images.pexels.com/photos/7697789/pexels-photo-7697789.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 },
            { user: userMap.felipe._id, mediaUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 20 },
            { user: userMap.pedro_almeida._id, mediaUrl: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 15 },
            { user: userMap.rodrigo_barros._id, mediaUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 }
        ];
        await Story.insertMany(storiesData);
        console.log(`✅ ${storiesData.length} stories criados.`);
        await sleep(500);

        // 7. Simula conversas PERSONALIZADAS do Admin com TODOS os usuários
        console.log('💬 Criando diálogos personalizados do Admin...');
        const adminDialogues = {
            // ... (nenhuma alteração aqui, os diálogos estão corretos)
            jacquetenorio: {
                adminMsg: "Olá, Jacque! Bem-vinda à AceleraHOF. Seu conteúdo sobre cuidados com a pele é fantástico e inspira muita gente. Parabéns pelo excelente trabalho!",
                userReply: "Oi! Muito obrigada pelo carinho e pelas boas-vindas. Feliz em fazer parte desta comunidade! ✨"
            },
            anaclara: {
                adminMsg: "Oi, Ana Clara! Seja muito bem-vinda. Suas maquiagens são verdadeiras obras de arte. É um prazer ter seu talento na nossa plataforma.",
                userReply: "Olá! Eu que agradeço! Adorando o espaço para compartilhar minha paixão. 💄"
            },
            emmilly: {
                adminMsg: "Emmilly, olá! Vimos que você é especialista em design de sobrancelhas. Seu trabalho de realçar o olhar é incrível. Seja bem-vinda!",
                userReply: "Oi, obrigada! Fico feliz que gostaram. Vamos deixar todo mundo com o olhar poderoso! haha"
            },
            nathaliamiotto: {
                adminMsg: "Dra. Nathalia, que honra tê-la conosco na AceleraHOF. Seu conhecimento como dermatologista agrega um valor imenso à nossa comunidade. Bem-vinda!",
                userReply: "Olá! Agradeço as boas-vindas. Acredito que a informação de qualidade é fundamental. Contem comigo."
            },
            henrique: {
                adminMsg: "Fala, Henrique! Bem-vindo ao AceleraHOF. Vi que você também é do mundo do código. Qualquer feedback técnico sobre a plataforma, suas ideias serão super bem-vindas!",
                userReply: "E aí! Show de bola, obrigado! Pode deixar, darei meus pitacos sim. A plataforma está muito legal, parabéns!"
            },
            camila: {
                adminMsg: "Olá, Camila! Bem-vinda. A biomedicina estética é uma área fascinante e em pleno crescimento. Que bom ter sua expertise científica por aqui!",
                userReply: "Oi! Obrigada! É uma área que amo. Feliz em poder trocar conhecimentos aqui."
            },
            felipe: {
                adminMsg: "Felipe, seja bem-vindo! Um bom posicionamento é a chave para o sucesso de muitos profissionais aqui. Tenho certeza que seu conteúdo vai ajudar muita gente a crescer.",
                userReply: "Com certeza! Obrigado pelas boas-vindas. Meu objetivo é exatamente esse, ajudar a galera a decolar. 🚀"
            },
            annaclarabrum: {
                adminMsg: "Olá, Anna Clara! Fisioterapia Dermatofuncional é incrível! Uma abordagem que une saúde e estética de forma completa. Seja muito bem-vinda!",
                userReply: "Olá, muito obrigada! É exatamente essa a minha paixão. Adorei a proposta da rede!"
            },
            lucas_santos: {
                adminMsg: "Lucas, bem-vindo! Uma boa imagem é essencial para um bom posicionamento. Seu olhar fotográfico vai agregar muito aqui!",
                userReply: "Valeu! Fico feliz que curtiram meu trabalho. Contem comigo para os cliques e dicas de imagem!"
            },
            sofia_lima: {
                adminMsg: "Olá, Sofia! Bem-vinda à AceleraHOF. É ótimo ter uma esteticista com foco em beleza integrativa. Sua visão holística é um diferencial!",
                userReply: "Oi! Exatamente! Obrigada pela recepção. Vamos falar muito sobre como os cuidados se integram."
            },
            pedro_almeida: {
                adminMsg: "Pedro, seja bem-vindo! A conexão entre fisioterapia e bem-estar é total. Com certeza seu conteúdo vai motivar nossa comunidade.",
                userReply: "Opa, com certeza! Obrigado! A ideia é mostrar a importância do movimento para a saúde da pele."
            },
            isabela_costa: {
                adminMsg: "Isabela, bem-vinda! A micropigmentação é uma arte e seu trabalho é impecável. Feliz em ter você na AceleraHOF!",
                userReply: "Muito obrigada! Amei o convite e o espaço. Vamos realçar muitas belezas por aqui."
            },
            rafael_oliveira: {
                adminMsg: "Fala, Rafael! Bem-vindo, mestre das tesouras. O cuidado com os cabelos é fundamental e seu talento agrega demais à plataforma.",
                userReply: "E aí, beleza? Valeu pela moral! Tamo junto pra fortalecer a cena da beleza capilar."
            },
            gabriel_souza: {
                adminMsg: "Gabriel, seja bem-vindo! A fisio dermatofuncional é saúde e qualidade de vida. Um tema super importante e que tem tudo a ver com bem-estar.",
                userReply: "Olá, obrigado! O corpo e a pele agradecem os cuidados. Bom saber que aqui se valoriza a saúde integrada."
            },
            beatriz_rocha: {
                adminMsg: "Beatriz, bem-vinda! O posicionamento de imagem é fascinante. Ajudar as pessoas a comunicarem seu valor é um trabalho incrível.",
                userReply: "Muito obrigada! É transformador. Feliz em compartilhar um pouco desse universo com vocês."
            },
            tiago_pereira: {
                adminMsg: "Tiago, bem-vindo! Um especialista em posicionamento que entende de beleza é um achado. Essencial para o sucesso de todos aqui.",
                userReply: "Fala! Obrigado! A área da beleza tem um potencial gigante no digital. Vamos explorar isso juntos."
            },
            julia_gomes: {
                adminMsg: "Júlia, seja bem-vinda! A visão do biomédico na estética, unindo ciência e beleza, é super valiosa. Que bom que você está aqui!",
                userReply: "Olá! Eu que agradeço! A ciência por trás dos procedimentos é minha paixão."
            },
            bruno_carvalho: {
                adminMsg: "Bruno, bem-vindo à AceleraHOF. A fisio com foco em terapia manual é uma arte de cura e relaxamento. Essencial para o bem-estar que tanto falamos aqui.",
                userReply: "Obrigado! Fico feliz em ver a terapia manual sendo valorizada. Contem comigo para aliviar as tensões!"
            },
            carolina_fernandes: {
                adminMsg: "Dra. Carolina, bem-vinda! A harmonização facial feita por um biomédico traz segurança e ciência. Sua expertise é um grande diferencial para a nossa rede.",
                userReply: "Olá, muito obrigada! Com certeza, a biomedicina estética é o futuro. Feliz em participar."
            },
            vanessa_melo: {
                adminMsg: "Vanessa, olá! Bem-vinda, estrela! Como esteticista e influencer, sua comunicação é fantástica. Vai brilhar muito aqui!",
                userReply: "Oii, que fofo! Muito obrigada! Super animada para unir minhas duas paixões e interagir com todo mundo aqui na AceleraHOF! ❤️"
            },
            rodrigo_barros: {
                adminMsg: "Rodrigo, bem-vindo! É uma honra ter um esteticista com sua visão de mercado na plataforma. Sua experiência enriquece nossa comunidade.",
                userReply: "Obrigado. Acredito no potencial desta plataforma para gerar conexões e negócios. Parabéns pela iniciativa."
            },
        };

        for (const user of allUsersExceptAdmin) {
            const dialogue = adminDialogues[user.username];
            if (dialogue) {
                const chat = await Chat.create({ participants: [admin._id, user._id] });
                const msg1 = await Message.create({ sender: admin._id, content: dialogue.adminMsg, chat: chat._id });
                await sleep(50); // Pequeno delay para simular tempo de resposta
                const msg2 = await Message.create({ sender: user._id, content: dialogue.userReply, chat: chat._id });
                chat.lastMessage = msg2._id;
                await chat.save();
            }
        }
        
        console.log(`✅ ${allUsersExceptAdmin.length} conversas com o admin simuladas.`);
        console.log('---------------------------------');
        console.log('🎉 Seeder finalizado com sucesso! A rede social está VIVA e CORRIGIDA! 🎉');
        process.exit();

    } catch (error) {
        console.error(`❌ ERRO NO SEEDER: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        console.log('🔥 Destruindo todos os dados...');
        await Post.deleteMany();
        await User.deleteMany();
        await Chat.deleteMany();
        await Message.deleteMany();
        await Story.deleteMany();
        console.log('✅ Dados destruídos com sucesso!');
        process.exit();
    } catch (error) {
        console.error(`❌ Erro ao destruir dados: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}