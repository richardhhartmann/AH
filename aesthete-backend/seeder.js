const path = require('path');
const fs = require('fs'); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Ad = require('./src/models/Ad'); 
const Chat = require('./src/models/Chat');
const Message = require('./src/models/Message');
const Story = require('./src/models/Story');
const Comment = require('./src/models/Comment');

const logoPath = path.join(__dirname, 'uploads', 'avatars', 'logo.png');

const localLogoApiRoute = '/uploads/avatars/logo.png';

const fallbackLogoUrl = 'https://i.imgur.com/iliidAM.jpeg';

let logoImage;
if (fs.existsSync(logoPath)) {
  logoImage = localLogoApiRoute;
  console.log('✅ Logo local encontrado. Usando o caminho da API.');
} else {
  logoImage = fallbackLogoUrl;
  console.log('⚠️ Logo local não encontrado. Usando URL de fallback.');
}

dotenv.config();

connectDB();

const usersData = [
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
        profession: 'Programador',
        avatar: logoImage,
        bio: 'Conectando os maiores talentos da estética. A casa do profissional de sucesso.',
        isAdmin: true,
    },
    {
        username: 'lucas_santos',
        email: 'lucas.santos@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8fDA%3D',
        bio: 'Capturando a essência da beleza em cada clique. A imagem como pilar do posicionamento digital.',
    },
    {
        username: 'sofia_lima',
        email: 'sofia.lima@example.com',
        password: 'password123',
        profession: 'Esteticista',
        avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVyc29ufGVufDB8fDB8fHww',
        bio: 'A beleza começa de dentro para fora. Estética integrativa para uma pele radiante.',
    },
    {
        username: 'pedro_almeida',
        email: 'pedro.almeida@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional',
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
        profession: 'Cabeleireiro(a)',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww',
        bio: 'Estilo e precisão para o homem moderno. Mais que um corte, uma assinatura.',
    },
    {
        username: 'gabriel_souza',
        email: 'gabriel.souza@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Alinhando seu corpo, melhorando sua pele. Bem-estar que irradia de dentro para fora.',
    },
    {
        username: 'beatriz_rocha',
        email: 'beatriz.rocha@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento',
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbWFufGVufDB8fDB8fHww',
        bio: 'A imagem pessoal como ferramenta de sucesso. Vista-se de confiança e conquiste seu espaço.',
    },
    {
        username: 'tiago_pereira',
        email: 'tiago.pereira@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento',
        avatar: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Criando conexões e engajamento para marcas de beleza. #socialmediamarketing',
    },
    {
        username: 'julia_gomes',
        email: 'julia.gomes@example.com',
        password: 'password123',
        profession: 'Biomédico',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdvbWFufGVufDB8fDB8fHww',
        bio: 'A ciência biomédica aplicada à estética avançada. Procedimentos para a sua melhor versão.',
    },
    {
        username: 'bruno_carvalho',
        email: 'bruno.carvalho@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional',
        avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fG1hbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Aliviando tensões, restaurando energias. Toque terapêutico para corpo e mente.',
    },
    {
        username: 'carolina_fernandes',
        email: 'carolina.f@example.com',
        password: 'password123',
        profession: 'Biomédico',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVudGlzdHxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Criando sorrisos e faces harmônicas. A saúde e a estética orofacial em primeiro lugar!',
    },
    {
        username: 'vanessa_melo',
        email: 'vanessa.melo@example.com',
        password: 'password123',
        profession: 'Esteticista',
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5mbHVlbmNlcnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Esteticista e influencer. Compartilhando meu dia a dia e dicas de beleza com o mundo. #beautytips',
    },
    {
        username: 'rodrigo_barros',
        email: 'rodrigo.barros@example.com',
        password: 'password123',
        profession: 'Esteticista',
        avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Esteticista e dono de uma rede de clínicas. Buscando sempre inovar no mercado da beleza.',
    },
    {
        username: 'andre_silva',
        email: 'andre.silva@example.com',
        password: 'password123',
        profession: 'Especialista em Posicionamento',
        avatar: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1hbnxlbnwwfHwwfHx8MA%3D%3D',
        bio: 'Estrategista de marca para profissionais da saúde e beleza. Construa uma marca de autoridade.',
    },
    {
        username: 'marcelo_campos',
        email: 'marcelo.campos@example.com',
        password: 'password123',
        profession: 'Fisioterapeuta Dermatofuncional',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9jdG9yfGVufDB8fDB8fHww',
        bio: 'Recuperação pós-operatória e tratamentos para celulite e flacidez. Cuidando da sua saúde estética.',
    },
];

const adsData = [
    {
        companyName: 'Clínica BelleVie',
        headline: 'Agende sua harmonização facial conosco!',
        description: 'Resultados naturais que realçam a sua beleza. Use o código AH15 para 15% de desconto.',
        mediaUrl: 'https://images.pexels.com/photos/3762873/pexels-photo-3762873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        callToAction: {
            text: 'Saiba Mais',
            url: 'https://www.instagram.com', // Link de destino do anúncio
        },
        status: 'active',
    },
    {
        companyName: 'Dermato Skincare',
        headline: 'O sérum de Vitamina C que vai revolucionar sua pele.',
        description: 'Fórmula exclusiva com antioxidantes potentes para uma pele mais iluminada e uniforme.',
        mediaUrl: 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        callToAction: {
            text: 'Comprar Agora',
            url: 'https://www.instagram.com',
        },
        status: 'active',
    },
    {
        companyName: 'Estética Avançada Pro',
        headline: 'Curso de Microagulhamento para Profissionais',
        description: 'Aprenda a técnica que está transformando o mercado da estética e aumente seu faturamento.',
        mediaUrl: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        callToAction: {
            text: 'Inscreva-se',
            url: 'https://www.instagram.com',
        },
        status: 'active',
    }
];

const getRandomSubset = (arr, size) => arr.sort(() => 0.5 - Math.random()).slice(0, size);
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const importData = async () => {
    try {
        console.log('🚀 Iniciando o processo de seeding...');

        console.log('🧹 Limpando coleções...');
        await Post.deleteMany();
        await User.deleteMany();
        await Ad.deleteMany();
        await Chat.deleteMany();
        await Message.deleteMany();
        await Story.deleteMany();
        console.log('✅ Coleções limpas.');
        await sleep(500);

        const createdUsers = await User.create(usersData);
        console.log(`👤 ${createdUsers.length} usuários criados.`);
        await sleep(500);

        const userMap = createdUsers.reduce((acc, user) => {
            acc[user.username] = user;
            return acc;
        }, {});

        console.log('🕸️ Criando rede de seguidores complexa...');
        const admin = userMap.acelerahof;
        const allUsersExceptAdmin = createdUsers.filter(u => u.id !== admin.id);

        for (const user of createdUsers) {
            if (user.id === admin.id) {
                user.following = allUsersExceptAdmin.map(u => u._id);
            } else {
                user.followers.push(admin._id);
                const usersToFollow = getRandomSubset(allUsersExceptAdmin.filter(u => u.id !== user.id), Math.floor(Math.random() * 11) + 5);
                user.following.push(...usersToFollow.map(u => u._id));
                for (const followedUser of usersToFollow) {
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

        console.log('📝 Criando posts...');
        const postsData = [
            { user: userMap.jacquetenorio._id, caption: 'Dia de spa em casa! Máscara de argila verde para purificar. Quem mais ama? ✨ #skincare #autocuidado', mediaUrl: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.jacquetenorio._id, caption: 'Dia de spa em casa! Máscara de argila verde para purificar. Quem mais ama? ✨ #skincare #autocuidado', mediaUrl: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.jacquetenorio._id, caption: 'Dia de spa em casa! Máscara de argila verde para purificar. Quem mais ama? ✨ #skincare #autocuidado', mediaUrl: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.anaclara._id, caption: 'Resultado da make de hoje! Um esfumado clássico que nunca erra. O que acharam? 💄 #makeup #makeuptutorial', mediaUrl: 'https://images.pexels.com/photos/3762662/pexels-photo-3762662.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.anaclara._id, caption: 'Resultado da make de hoje! Um esfumado clássico que nunca erra. O que acharam? 💄 #makeup #makeuptutorial', mediaUrl: 'https://images.pexels.com/photos/3762662/pexels-photo-3762662.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.nathaliamiotto._id, caption: 'Não se esqueça do protetor solar, mesmo em dias nublados! A prevenção é o melhor tratamento. #dermatologia #sunscreen', mediaUrl: 'https://images.pexels.com/photos/3762870/pexels-photo-3762870.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.emmilly._id, caption: 'Design de sobrancelhas que realça o olhar. Agende seu horário!', mediaUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.henrique._id, caption: 'Trabalhando em uma nova feature para o app. Alguma sugestão do que vocês gostariam de ver por aqui? 👨‍💻 #devlife #feedback', mediaUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.felipe._id, caption: '3 dicas de ouro para profissionais da beleza se destacarem no Instagram. A primeira é: constância! Quer saber as outras? #marketingdigital', mediaUrl: 'https://images.pexels.com/photos/6476587/pexels-photo-6476587.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.lucas_santos._id, caption: 'A foto de perfil é seu cartão de visitas. Invista em uma imagem que transmita seu profissionalismo. #fotografia #brandingpessoal', mediaUrl: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.sofia_lima._id, caption: 'Dica de hoje: suco verde para uma pele incrível! A beleza que vem de dentro reflete por fora. 🍍 #nutricao #pelesaudavel', mediaUrl: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.isabela_costa._id, caption: 'O poder da micropigmentação labial. Lábios corados e definidos por muito mais tempo. #pmu #microlabial', mediaUrl: 'https://images.pexels.com/photos/7879975/pexels-photo-7879975.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.beatriz_rocha._id, caption: 'Qual a sua mensagem? O posicionamento de marca pessoal pode transformar seu visual e carreira. #consultoriadeimagem', mediaUrl: 'https://images.pexels.com/photos/5708253/pexels-photo-5708253.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.vanessa_melo._id, caption: 'Recebidos do mês! 😍 Tantas novidades incríveis para testar com vocês. Qual produto querem ver resenha primeiro? #unboxing #beautytips', mediaUrl: 'https://images.pexels.com/photos/7262995/pexels-photo-7262995.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.rodrigo_barros._id, caption: 'Visitando nossa nova unidade. Muito orgulhoso do crescimento da nossa equipe e do padrão de qualidade que mantemos. #empreendedorismo #estetica', mediaUrl: 'https://images.pexels.com/photos/8867431/pexels-photo-8867431.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.carolina_fernandes._id, caption: 'Um rosto harmônico muda tudo! Os procedimentos com bioestimuladores de colágeno são seguros e com ótimos resultados. #biomedicinaestetica #harmonizacaofacial', mediaUrl: 'https://images.pexels.com/photos/6529841/pexels-photo-6529841.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.rafael_oliveira._id, caption: 'Antes e depois que fala, né? Corte e finalização impecáveis. Satisfação do cliente é a meta. 💈 #barbershop #hairstyle', mediaUrl: 'https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.andre_silva._id, caption: 'Sua marca pessoal é o que as pessoas dizem sobre você quando você não está na sala. Vamos construir a sua juntos? #branding #posicionamento', mediaUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.marcelo_campos._id, caption: 'A drenagem linfática no pós-operatório de cirurgias plásticas é essencial para reduzir o inchaço e acelerar a recuperação. #fisioterapiadermatofuncional #posoperatorio', mediaUrl: 'https://images.pexels.com/photos/4506269/pexels-photo-4506269.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.jacquetenorio._id, caption: 'Sextou com peeling de diamante! Renovação celular para uma pele lisinha e radiante. Quem vem? #peelingdediamante #esteticaavancada', mediaUrl: 'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.anaclara._id, caption: 'Delineado gráfico para sair do óbvio! Gostam de makes mais ousadas? Me conta aqui! 👀 #graphicliner #makeartistica', mediaUrl: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.nathaliamiotto._id, caption: 'Toxina botulínica preventiva: começar cedo pode evitar a formação de rugas profundas no futuro. Converse com seu dermatologista!', mediaUrl: 'https://images.pexels.com/photos/5215017/pexels-photo-5215017.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.felipe._id, caption: 'Erro comum no marketing para estética: não ter um público-alvo definido. Falar com todo mundo é o mesmo que não falar com ninguém. #marketingdeconteudo', mediaUrl: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=500' },
            { user: userMap.isabela_costa._id, caption: 'Neutralização de cor em sobrancelhas que ficaram com tons indesejados. É possível corrigir e ter um resultado lindo de novo! #micropigmentacao #correcao', mediaUrl: 'https://images.pexels.com/photos/4126681/pexels-photo-4126681.jpeg?auto=compress&cs=tinysrgb&w=500' },
        ];

        let createdPosts = await Post.insertMany(postsData);
        console.log(`✅ ${createdPosts.length} posts criados.`);
        await sleep(500);

        console.log('💬 Adicionando interações (curtidas e comentários)...');
        const commentsBank = [
            'Que incrível!', 'Amei o resultado!', 'Parabéns pelo trabalho!', 'Preciso disso na minha vida!',
            'Que dica maravilhosa!', 'Você arrasa demais!', 'Sensacional!', 'Obrigado por compartilhar!',
            'Ficou perfeito!', 'Já quero testar!', 'Referência de profissional!', 'Conteúdo de muito valor!'
        ];

        for (const post of createdPosts) {
            // Lógica de curtidas
            const likers = getRandomSubset(allUsersExceptAdmin, Math.floor(Math.random() * (allUsersExceptAdmin.length - 5)) + 5);
            post.likes = likers.map(u => u._id);

            // Lógica de comentários
            if (Math.random() > 0.3) { 
                const commenters = getRandomSubset(allUsersExceptAdmin.filter(u => !u._id.equals(post.user)), Math.floor(Math.random() * 8) + 2);
                
                const createdComments = await Promise.all(commenters.map(commenter => {
                    return Comment.create({
                        text: getRandomElement(commentsBank),
                        author: commenter._id,
                        post: post._id
                    });
                }));

                const commentIds = createdComments.map(c => c._id);
                post.comments.push(...commentIds);
            }
            
            // Salva o post com as curtidas e os IDs dos comentários
            await post.save();
        }

        console.log('✅ Interações adicionadas.');
        await sleep(500);

        console.log('📢 Criando anúncios...');
        await Ad.create(adsData);
        console.log(`✅ ${adsData.length} anúncios criados.`);
        await sleep(500);

        console.log('🤳 Criando mais stories...');
        const storiesData = [
            { user: userMap.jacquetenorio._id, mediaUrl: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 15 },
            { user: userMap.anaclara._id, mediaUrl: 'https://images.pexels.com/photos/5938503/pexels-photo-5938503.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 },
            { user: userMap.vanessa_melo._id, mediaUrl: 'https://images.pexels.com/photos/7697789/pexels-photo-7697789.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 },
            { user: userMap.felipe._id, mediaUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 20 },
            { user: userMap.pedro_almeida._id, mediaUrl: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 15 },
            { user: userMap.rodrigo_barros._id, mediaUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 10 },
            { user: userMap.isabela_costa._id, mediaUrl: 'https://images.pexels.com/photos/12093859/pexels-photo-12093859.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 12 },
            { user: userMap.henrique._id, mediaUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=500', duration: 15 },
        ];
        await Story.insertMany(storiesData);
        console.log(`✅ ${storiesData.length} stories criados.`);
        await sleep(500);

        console.log('💬 Criando diálogos expandidos do Admin...');
        const adminDialogues = {
            jacquetenorio: [
                { sender: 'admin', content: 'Olá, Jacque! Bem-vinda à AceleraHOF. Seu conteúdo sobre cuidados com a pele é fantástico e inspira muita gente.' },
                { sender: 'user', content: 'Oi! Nossa, muito obrigada pelo carinho e pelas boas-vindas! Fico super feliz em fazer parte desta comunidade. ✨' },
                { sender: 'admin', content: 'Imagina! Vimos seu último post sobre o peeling de diamante, que trabalho incrível! É exatamente esse tipo de conteúdo de valor que queremos impulsionar aqui.' },
                { sender: 'user', content: 'Que legal que vocês viram! É um dos procedimentos que mais amo fazer. A plataforma parece incrível para networking.' },
                { sender: 'admin', content: 'Com certeza! Explore bastante, se conecte com outros profissionais. Se precisar de qualquer ajuda ou tiver alguma sugestão, é só chamar!' },
            ],
            anaclara: [
                { sender: 'admin', content: 'Oi, Ana Clara! Seja muito bem-vinda à AceleraHOF. Suas maquiagens são verdadeiras obras de arte. É um prazer ter seu talento aqui.' },
                { sender: 'user', content: 'Olá! Eu que agradeço! Adorando o espaço para compartilhar minha paixão. 💄 A interface é super bonita!' },
                { sender: 'admin', content: 'Que bom que gostou! A gente se esforça pra criar um ambiente inspirador. Seu post do delineado gráfico ficou demais!' },
                { sender: 'user', content: 'Obrigada! Fico feliz! Quero trazer mais tutoriais em breve.' },
                { sender: 'admin', content: 'Excelente ideia! A comunidade vai amar. Conte com nosso apoio para divulgar!' },
            ],
            nathaliamiotto: [
                { sender: 'admin', content: 'Dra. Nathalia, que honra tê-la conosco na AceleraHOF. Seu conhecimento como dermatologista agrega um valor imenso à nossa comunidade. Bem-vinda!' },
                { sender: 'user', content: 'Olá! Agradeço as boas-vindas. Acredito que a informação de qualidade é fundamental. Contem comigo.' },
                { sender: 'admin', content: 'Ficamos muito felizes em ouvir isso. Seu post sobre toxina preventiva foi super didático e importante. Precisamos de mais profissionais como você.' },
                { sender: 'user', content: 'Obrigada. A desmistificação de procedimentos é parte do meu trabalho. A plataforma é uma ótima ferramenta para isso.' },
                { sender: 'admin', content: 'Concordamos plenamente. Sinta-se em casa!' },
            ],
             felipe: [
                { sender: 'admin', content: 'Felipe, seja bem-vindo! Um bom posicionamento é a chave para o sucesso de muitos profissionais aqui. Tenho certeza que seu conteúdo vai ajudar muita gente a crescer.' },
                { sender: 'user', content: 'Com certeza! Obrigado pelas boas-vindas. Meu objetivo é exatamente esse, ajudar a galera a decolar. 🚀' },
                { sender: 'admin', content: 'Vimos sua dica sobre definir o público-alvo. Essencial! Muitos aqui vão se beneficiar disso.' },
                { sender: 'user', content: 'É o primeiro passo de todos! Fico feliz em poder contribuir. A plataforma tem um potencial gigante para conexões.' },
                 { sender: 'admin', content: 'Exato! Use e abuse do networking. Sucesso!' },
            ],
            vanessa_melo: [
                { sender: 'admin', content: 'Vanessa, olá! Bem-vinda, estrela! Como esteticista e influencer, sua comunicação é fantástica. Vai brilhar muito aqui!' },
                { sender: 'user', content: 'Oii, que fofo! Muito obrigada! Super animada para unir minhas duas paixões e interagir com todo mundo aqui na AceleraHOF! ❤️' },
                { sender: 'admin', content: 'Já estamos ansiosos pelos seus unboxings e resenhas! A galera vai pirar.' },
                { sender: 'user', content: 'Hahaha pode deixar! Já estou preparando um conteúdo especial de lançamento para postar aqui. 😉' },
                { sender: 'admin', content: 'Maravilha! Vamos ficar de olho para compartilhar!' },
            ],
             rodrigo_barros: [
                { sender: 'admin', content: 'Rodrigo, bem-vindo! É uma honra ter um esteticista com sua visão de mercado na plataforma. Sua experiência enriquece nossa comunidade.' },
                { sender: 'user', content: 'Obrigado. Acredito no potencial desta plataforma para gerar conexões e negócios. Parabéns pela iniciativa.' },
                { sender: 'admin', content: 'Ficamos felizes com o seu feedback. O post sobre a nova unidade mostrou a força da sua marca. Inspirador!' },
                { sender: 'user', content: 'A expansão é fruto de muito trabalho. Espero poder trocar experiências sobre gestão com outros empreendedores por aqui.' },
                 { sender: 'admin', content: 'Esse é o espírito! Com certeza encontrará ótimos contatos. Seja muito bem-vindo!' },
            ],
        };

        for (const user of allUsersExceptAdmin) {
            const dialogueMessages = adminDialogues[user.username];
            if (dialogueMessages && dialogueMessages.length > 0) {
                const chat = await Chat.create({ participants: [admin._id, user._id] });
                let lastMessageId;

                for (const msgData of dialogueMessages) {
                    const senderId = msgData.sender === 'admin' ? admin._id : user._id;
                    const message = await Message.create({
                        sender: senderId,
                        content: msgData.content,
                        chat: chat._id
                    });
                    lastMessageId = message._id;
                    await sleep(15);
                }

                chat.lastMessage = lastMessageId;
                await chat.save();
            }
        }
        console.log(`✅ Conversas expandidas com o admin simuladas.`);
        await sleep(500);

        console.log('💬 Criando chats complexos entre usuários...');
        const userChats = [
            {
                participants: ['anaclara', 'lucas_santos'],
                messages: [
                    { sender: 'anaclara', content: 'Oi Lucas, tudo bem? Admiro muito seu trabalho de fotografia! Que tal fazermos uma parceria para um ensaio com uma make bem conceitual?' },
                    { sender: 'lucas_santos', content: 'Olá Ana! Tudo ótimo! Eu adoraria, seu trabalho com maquiagem é incrível. Tenho algumas ideias de locação que combinariam muito. O que acha?' },
                    { sender: 'anaclara', content: 'Perfeito! Pensei num conceito mais "cyberpunk", com tons neon. Você curte?' },
                    { sender: 'lucas_santos', content: 'Nossa, genial! Super topo. Podemos marcar uma chamada para alinhar os detalhes essa semana?' },
                    { sender: 'anaclara', content: 'Claro! Tenho disponibilidade na quinta à tarde. Pode ser?' },
                    { sender: 'lucas_santos', content: 'Combinado! Te chamo na quinta então. Ansioso por isso!' }
                ]
            },
            {
                participants: ['nathaliamiotto', 'jacquetenorio'],
                messages: [
                    { sender: 'jacquetenorio', content: 'Dra. Nathalia, seus posts sobre protetor solar são muito esclarecedores! Tenho uma cliente com melasma, e sempre reforço suas dicas.' },
                    { sender: 'nathaliamiotto', content: 'Oi Jacque! Que ótimo saber disso! A conscientização é o primeiro passo. Você tem usado algum ativo clareador nos seus protocolos?' },
                    { sender: 'jacquetenorio', content: 'Sim, tenho tido bons resultados com ácido mandélico. Mas sempre com muita cautela e indicação de acompanhamento médico, claro.' },
                    { sender: 'nathaliamiotto', content: 'Excelente escolha! O mandélico é mais seguro para fototipos mais altos. Continue com o ótimo trabalho, a parceria dermato-esteticista é fundamental para o sucesso do tratamento.' },
                    { sender: 'jacquetenorio', content: 'Concordo plenamente! Obrigada pela troca, Dra. ❤️' }
                ]
            },
            {
                participants: ['felipe', 'emmilly'],
                messages: [
                    { sender: 'felipe', content: 'Emmilly, vi seu último post do design, ficou show! Uma dica: que tal fazer um Reels mostrando o processo acelerado? Gera muito engajamento!' },
                    { sender: 'emmilly', content: 'Oi Felipe! Puxa, que ótima ideia! Eu sou meio tímida com vídeos, mas vou tentar. Precisa de algum app específico?' },
                    { sender: 'felipe', content: 'Capcut é ótimo e super fácil de usar! Se precisar de umas dicas de edição, me dá um toque. Seu trabalho merece ser mais visto!' },
                    { sender: 'emmilly', content: 'Nossa, muito obrigada mesmo! Vou baixar e tentar esse fim de semana. Valeu pela força! 💪' },
                    { sender: 'felipe', content: 'Imagina! Para isso que estamos aqui na comunidade. Sucesso!' }
                ]
            },
            {
                participants: ['carolina_fernandes', 'annaclarabrum'],
                messages: [
                    { sender: 'carolina_fernandes', content: 'Anna, tudo bem? Vi que você trabalha muito com pós-operatório. Tenho uma paciente que vai fazer fios de PDO e queria indicar sessões de drenagem com você.' },
                    { sender: 'annaclarabrum', content: 'Olá, Carolina! Tudo ótimo! Seria um prazer atendê-la. A drenagem após os fios ajuda muito a diminuir o edema e otimizar os resultados. Quando será o procedimento?' },
                    { sender: 'carolina_fernandes', content: 'Será na próxima sexta. Podemos iniciar as sessões uns 3 dias depois, o que acha?' },
                    { sender: 'annaclarabrum', content: 'Perfeito! Peço para ela entrar em contato para agendarmos. A associação do bioestimulador com a fisio é fantástica. Obrigada pela confiança!' },
                    { sender: 'carolina_fernandes', content: 'Eu que agradeço! Confio muito no seu trabalho. Vamos nos falando.' },
                    { sender: 'annaclarabrum', content: 'Combinado! 😊' }
                ]
            }
        ];

        for (const chatData of userChats) {
            const participantObjects = chatData.participants.map(username => userMap[username]);
            if (participantObjects.every(p => p)) {
                const chat = await Chat.create({ participants: participantObjects.map(p => p._id) });
                let lastMessageId;

                for (const msgData of chatData.messages) {
                    const sender = userMap[msgData.sender];
                    if (sender) {
                        const message = await Message.create({ sender: sender._id, content: msgData.content, chat: chat._id });
                        lastMessageId = message._id;
                        await sleep(15);
                    }
                }

                chat.lastMessage = lastMessageId;
                await chat.save();
            }
        }
        console.log(`✅ ${userChats.length} chats complexos criados.`);


        console.log('---------------------------------');
        console.log('🎉 Seeder finalizado com sucesso! 🎉');
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